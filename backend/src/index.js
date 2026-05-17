require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./database/models');
const authRoutes = require('./modules/auth/routes');
const usersRoutes = require('./modules/users/routes');
const paymentsRoutes = require('./modules/payments/routes');
const errorHandler = require('./middleware/errorHandler');
const { requestId, securityHeaders, apiFirewall, rateLimit } = require('./middleware/security');
const auditTrail = require('./middleware/audit');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(requestId);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginResourcePolicy: { policy: 'same-site' }
}));
app.use(securityHeaders);
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3001'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy does not allow access from the specified Origin.'));
    }
  },
  credentials: true
}));
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '50kb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.FORM_BODY_LIMIT || '50kb' }));
app.use(rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 300,
  keyPrefix: 'api'
}));
app.use(apiFirewall);
app.use(auditTrail);

// Database connection
sequelize.authenticate()
  .then(() => {
    logger.info('Database connected successfully');
    sequelize.sync({ alter: false }).then(() => {
      logger.info('Database synced');
    });
  })
  .catch(err => logger.error('Unable to connect to the database:', err));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.get('/security/status', (req, res) => {
  res.json({
    status: 'active',
    controls: [
      'helmet_headers',
      'strict_cors',
      'request_id',
      'rate_limiting',
      'payload_limits',
      'api_firewall',
      'auth_throttling'
    ],
    timestamp: new Date()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/payments', paymentsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;
