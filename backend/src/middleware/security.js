const crypto = require('crypto');
const logger = require('../utils/logger');

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;

const blockedIps = new Set(
  (process.env.BLOCKED_IPS || '')
    .split(',')
    .map(ip => ip.trim())
    .filter(Boolean)
);

const suspiciousPatterns = [
  /\.\.\//,
  /<script/i,
  /union\s+select/i,
  /select\s+.+\s+from/i,
  /insert\s+into/i,
  /drop\s+table/i,
  /xp_cmdshell/i,
  /\$\{.*\}/,
];

const getClientIp = (req) => (
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
  req.socket.remoteAddress ||
  req.ip ||
  'unknown'
);

const requestId = (req, res, next) => {
  const id = req.headers['x-request-id'] || crypto.randomUUID();
  req.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
};

const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
};

const apiFirewall = (req, res, next) => {
  const ip = getClientIp(req);

  if (blockedIps.has(ip)) {
    logger.warn(`Blocked request from denylisted IP ${ip}`);
    return res.status(403).json({ message: 'Request blocked by security policy' });
  }

  const requestTarget = `${req.originalUrl} ${JSON.stringify(req.query)} ${JSON.stringify(req.body || {})}`;
  const hasSuspiciousInput = suspiciousPatterns.some(pattern => pattern.test(requestTarget));

  if (hasSuspiciousInput) {
    logger.warn(`Suspicious request blocked`, {
      ip,
      method: req.method,
      path: req.originalUrl,
      requestId: req.requestId
    });
    return res.status(400).json({ message: 'Suspicious request blocked' });
  }

  next();
};

const rateLimitStore = new Map();

const rateLimit = ({ windowMs = DEFAULT_WINDOW_MS, max = 100, keyPrefix = 'global' } = {}) => {
  return (req, res, next) => {
    const now = Date.now();
    const ip = getClientIp(req);
    const key = `${keyPrefix}:${ip}`;
    const existing = rateLimitStore.get(key);

    if (!existing || existing.resetAt <= now) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - 1);
      return next();
    }

    existing.count += 1;
    const remaining = Math.max(max - existing.count, 0);
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(existing.resetAt / 1000));

    if (existing.count > max) {
      logger.warn(`Rate limit exceeded`, {
        ip,
        keyPrefix,
        path: req.originalUrl,
        requestId: req.requestId
      });
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }

    next();
  };
};

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}, DEFAULT_WINDOW_MS).unref();

module.exports = {
  requestId,
  securityHeaders,
  apiFirewall,
  rateLimit
};
