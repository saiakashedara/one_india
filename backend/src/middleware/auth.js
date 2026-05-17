const { verifyToken } = require('../utils/auth');
const logger = require('../utils/logger');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');
    
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    logger.error('Authentication error:', {
      message: error.message,
      requestId: req.requestId
    });
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
