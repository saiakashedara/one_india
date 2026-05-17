const { AuditLog } = require('../database/models');
const logger = require('../utils/logger');

const getClientIp = (req) => (
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
  req.socket.remoteAddress ||
  req.ip ||
  'unknown'
);

const auditTrail = (req, res, next) => {
  const startedAt = Date.now();

  res.on('finish', () => {
    const isInteresting =
      req.method !== 'GET' ||
      res.statusCode >= 400 ||
      req.originalUrl.startsWith('/api/auth');

    if (!isInteresting) return;

    AuditLog.create({
      userId: req.userId || null,
      action: `${req.method} ${req.originalUrl}`,
      method: req.method,
      path: req.originalUrl,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || '',
      statusCode: res.statusCode,
      requestId: req.requestId,
      metadata: {
        durationMs: Date.now() - startedAt
      }
    }).catch(error => {
      logger.error('Audit log write failed:', {
        message: error.message,
        requestId: req.requestId
      });
    });
  });

  next();
};

module.exports = auditTrail;
