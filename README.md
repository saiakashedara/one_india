# OneIndia Super App
## India's Premier Super App - Payments, Travel, Shopping, Home Services

OneIndia is a comprehensive super app platform built for mass market adoption in India. It integrates multiple services through a unified wallet, delivering a seamless experience for Indian users across all service modules.

---

## 🎯 Core Vision

**"Payments is the glue that binds all services."**

The unified wallet strategy makes OneIndia sticky:
- Once users trust your wallet, switching becomes painful
- Loyalty/rewards system spans all 4 modules
- Vernacular language support for Tier 2/3 cities

---

## 📦 Services (36-Week Roadmap)

### Phase 1: Payments Foundation (Weeks 1-12)
- User authentication (SMS OTP + Password)
- Wallet creation & management
- Money add/withdrawal
- P2P transfers
- KYC verification
- Transaction history
- Rewards system

### Phase 2: Travel (Weeks 13-24)
- Flight bookings
- Hotel reservations
- Bus/train ticketing
- Ride-sharing
- Integrated wallet payments

### Phase 3: Shopping (Weeks 25-32)
- Product catalog
- Shopping cart
- Order management
- Seller integration
- Marketplace commission model

### Phase 4: Home Services (Weeks 33-36)
- Service provider network
- Booking system
- Ratings & reviews
- Dynamic pricing
- Service delivery tracking

---

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js + Express.js
- PostgreSQL (Primary DB)
- Redis (Caching & Sessions)
- JWT (Authentication)
- Sequelize ORM

**Frontend:**
- React 18
- React Router
- Axios (HTTP Client)
- Zustand (State Management)
- Tailwind CSS
- TailwindCSS

**DevOps:**
- Docker & Docker Compose
- PostgreSQL 15
- Redis 7
- Node 18

### Project Structure

```
oneindia/
├── backend/                    # Node.js API
│   ├── src/
│   │   ├── index.js          # Main server
│   │   ├── config/           # Configuration
│   │   ├── database/         # DB models & schemas
│   │   ├── middleware/       # Express middleware
│   │   ├── modules/
│   │   │   ├── auth/         # Authentication
│   │   │   ├── payments/     # Payments module
│   │   │   ├── travel/       # Travel (Phase 2)
│   │   │   ├── shopping/     # Shopping (Phase 3)
│   │   │   └── services/     # Home services (Phase 4)
│   │   └── utils/            # Helper functions
│   ├── package.json
│   └── Dockerfile
├── frontend/                   # React Web App
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── services/         # API services
│   │   ├── context/          # React Context
│   │   ├── hooks/            # Custom hooks
│   │   └── styles/           # CSS files
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── docs/                       # Documentation
├── docker-compose.yml         # Local development
└── README.md                  # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

### Method 1: Local Development

1. **Clone the repository**
```bash
cd oneindia
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your configuration
npm run dev
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install
npm start
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### Method 2: Docker Compose

```bash
# From project root
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

---

## 📚 API Documentation

### Authentication Endpoints

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "phone": "9876543210",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "secure_password",
  "language": "en"
}

Response:
{
  "user": { ... },
  "token": "jwt_token_here"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "phone": "9876543210",
  "password": "secure_password"
}

Response:
{
  "user": { ... },
  "token": "jwt_token_here"
}
```

### Payments Endpoints

#### Get Wallet
```
GET /api/payments/wallet
Authorization: Bearer {token}

Response:
{
  "id": "uuid",
  "userId": "uuid",
  "balance": 5000.00,
  "currency": "INR",
  "walletStatus": "active"
}
```

#### Add Money
```
POST /api/payments/wallet/add-money
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 500,
  "paymentMethod": "card"
}

Response:
{
  "transaction": { ... },
  "wallet": { "balance": 5500.00 }
}
```

#### Transfer Money
```
POST /api/payments/transfer
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipientPhone": "9876543211",
  "amount": 100
}

Response:
{
  "referenceId": "TRANSFER_uuid",
  "status": "completed",
  "newBalance": 4900.00
}
```

#### Submit KYC
```
POST /api/payments/kyc/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "documentType": "aadhaar",
  "documentNumber": "123456789012"
}

Response:
{
  "kycId": "uuid",
  "status": "pending"
}
```

---

## 🔐 Security

- JWT tokens for authentication
- bcryptjs for password hashing
- CORS enabled (configurable)
- Helmet.js for HTTP headers
- Input validation with express-validator
- Rate limiting ready (to be implemented)
- SQL injection protection via Sequelize ORM

**Important:** Change all secrets in production!

---

## 📊 Database Schema

### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  passwordHash VARCHAR(255) NOT NULL,
  kycStatus ENUM('pending', 'verified', 'rejected'),
  language ENUM('en', 'hi', 'ta', 'te', 'kn', 'ml'),
  isActive BOOLEAN DEFAULT true,
  lastLogin TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Wallets
```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY,
  userId UUID FOREIGN KEY,
  balance DECIMAL(15, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'INR',
  walletStatus ENUM('active', 'frozen', 'suspended'),
  lastTransactionDate TIMESTAMP,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### Transactions
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  userId UUID FOREIGN KEY,
  transactionType ENUM('credit', 'debit', 'refund', 'transfer'),
  amount DECIMAL(15, 2),
  status ENUM('pending', 'completed', 'failed'),
  module ENUM('payments', 'travel', 'shopping', 'home_services'),
  referenceId VARCHAR(255) UNIQUE,
  metadata JSON,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd ../frontend
npm test
```

---

## 📈 Performance Optimizations

- Redis caching for frequently accessed data
- Database connection pooling
- JWT token-based stateless auth
- Frontend lazy loading & code splitting
- API response pagination
- Request debouncing

---

## 🌐 Internationalization

Current language support:
- English (en)
- Hindi (hi)
- Tamil (ta)
- Telugu (te)
- Kannada (kn)
- Malayalam (ml)

Add more languages in `User` model language enum.

---

## 📝 Environment Variables

See `.env.example` for all available options:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=oneindia_dev
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your_secret_key
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

---

## 🔄 Revenue Model (6 Streams)

1. **Payment Processing Commissions** (0.5-2% on all txns)
2. **Travel Module Commissions** (2-5% on bookings)
3. **Shopping Marketplace Commissions** (15-25% on GMV)
4. **Subscription Plans** (Premium features, ₹99-299/month)
5. **Fintech Products** (Loans, investments, insurance)
6. **Advertising** (Sponsored listings, cards)

---

## 📞 Support & Contact

For questions or issues:
- GitHub Issues: [Create an issue]
- Email: support@oneindia.com
- Documentation: See /docs folder

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🚀 Next Steps

1. ✅ Phase 1 Payments Foundation (Ready)
2. ⬜ Phase 2 Travel Module (In Progress)
3. ⬜ Phase 3 Shopping Module (Planned)
4. ⬜ Phase 4 Home Services (Planned)
5. ⬜ Mobile App (React Native)
6. ⬜ Admin Dashboard
7. ⬜ Business Intelligence

---

**Built with ❤️ for India's Digital Economy**
