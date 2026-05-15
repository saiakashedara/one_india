# OneIndia Development Guide

## Quick Start

### 1. Initial Setup

```bash
# Navigate to project
cd oneindia

# Copy environment template
cp .env.example .env

# Edit .env with your settings
# nano .env
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Start development server (auto-reload)
npm run dev

# Run tests
npm test

# Linting
npm run lint
npm run lint:fix
```

Backend API will be available at: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm build

# Run tests
npm test
```

Frontend will be available at: `http://localhost:3000`

### 4. Docker Setup (Optional)

```bash
# From project root
docker-compose up -d

# View logs
docker-compose logs backend
docker-compose logs frontend

# Stop services
docker-compose down
```

---

## Project Structure Explained

```
backend/
├── src/
│   ├── index.js                    # Express app entry point
│   ├── config/                     # Configuration files
│   ├── database/
│   │   ├── models.js              # Database initialization
│   │   └── schemas/               # Table schemas
│   ├── middleware/
│   │   ├── auth.js                # JWT verification
│   │   └── errorHandler.js        # Error handling
│   ├── modules/
│   │   ├── auth/                  # Authentication module
│   │   ├── payments/              # Payments module
│   │   ├── users/                 # User management
│   │   ├── travel/                # Travel (future)
│   │   ├── shopping/              # Shopping (future)
│   │   └── services/              # Home services (future)
│   └── utils/
│       ├── logger.js              # Logging utility
│       └── auth.js                # Auth helper functions
└── package.json

frontend/
├── src/
│   ├── App.js                     # Main component
│   ├── index.js                   # React entry point
│   ├── pages/
│   │   ├── LoginPage.js          # Login form
│   │   ├── RegisterPage.js       # Registration form
│   │   └── DashboardPage.js      # Main dashboard
│   ├── components/                # Reusable components
│   ├── services/
│   │   └── api.js                # API calls
│   ├── context/
│   │   └── AuthContext.js        # Auth state
│   ├── hooks/
│   │   └── useAuth.js            # Auth hook
│   └── styles/
│       ├── auth.css              # Auth styles
│       └── dashboard.css         # Dashboard styles
└── package.json
```

---

## Common Development Tasks

### Adding a New API Endpoint

1. **Create controller** in `backend/src/modules/[module]/controllers.js`
2. **Add route** in `backend/src/modules/[module]/routes.js`
3. **Import route** in `backend/src/index.js`

Example:
```javascript
// routes.js
router.post('/new-endpoint', authMiddleware, async (req, res) => {
  try {
    const result = await newFunction(req.userId, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// controllers.js
const newFunction = async (userId, data) => {
  // Your logic here
  return result;
};

module.exports = { newFunction };
```

### Adding a Database Table

1. Create schema file in `backend/src/database/schemas/tablename.js`
2. Define Sequelize model
3. Add model to `backend/src/database/models.js`

### Adding Frontend Page

1. Create component in `frontend/src/pages/ComponentName.js`
2. Add route in `frontend/src/App.js`
3. Add styles in `frontend/src/styles/`

---

## Database Migrations

```bash
# Create new migration
npm run migrate

# Reset database (development only)
# Delete database and run sync
```

---

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm test -- --coverage
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Watch mode (default)
# Press 'a' to run all tests
# Press 'w' to show menu

# Coverage
npm test -- --coverage
```

---

## Debugging

### Backend

```bash
# Run with inspector
node --inspect src/index.js

# In Chrome
# Open chrome://inspect
```

### Frontend

```bash
# React DevTools extension
# Install: Chrome Web Store

# Use console
console.log(variable)
```

---

## Common Issues & Solutions

### Port Already in Use

```bash
# Kill process on port
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Database Connection Error

1. Ensure PostgreSQL is running
2. Check DB credentials in `.env`
3. Verify database exists: `oneindia_dev`

### CORS Errors

Ensure frontend URL is in backend CORS config:
```javascript
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
})
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Performance Tips

### Backend

- Use Redis for caching
- Add database indexes for frequently queried columns
- Implement pagination for large datasets
- Use connection pooling

### Frontend

- Use React.memo for expensive components
- Implement code splitting with React.lazy
- Optimize images
- Use useCallback to prevent unnecessary renders

---

## Deployment Checklist

- [ ] Update environment variables
- [ ] Change JWT_SECRET
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Configure Redis persistence
- [ ] Set up monitoring/logging
- [ ] Test all endpoints
- [ ] Load test the application

---

## Useful Commands

```bash
# Backend
npm run dev          # Start dev server
npm run lint         # Check code style
npm run lint:fix     # Fix code style
npm test            # Run tests

# Frontend
npm start           # Start dev server
npm run build       # Build production
npm test            # Run tests
npm run lint        # Check code style

# Docker
docker-compose up -d              # Start services
docker-compose down               # Stop services
docker-compose logs -f backend    # View backend logs
```

---

## Code Style

### JavaScript

```javascript
// Use async/await
const getUser = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    logger.error('Error fetching user:', error);
    throw error;
  }
};

// Use destructuring
const { phone, password } = req.body;

// Use const/let (not var)
const name = 'John';
let count = 0;
```

### React

```javascript
// Use functional components
const MyComponent = ({ prop }) => {
  const [state, setState] = React.useState(null);

  React.useEffect(() => {
    // Side effects
  }, [dependencies]);

  return <div>{prop}</div>;
};

export default MyComponent;
```

---

## Resources

- [Node.js Docs](https://nodejs.org/docs/)
- [Express Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Sequelize Docs](https://sequelize.org/)

---

**Happy coding! 🚀**
