# OneIndia Architecture & Design Document

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ Web (React)      │  │ Mobile (Future)  │               │
│  └──────────────────┘  └──────────────────┘               │
└────────────────────┬────────────────────────────────────────┘
                     │
           ┌─────────▼─────────┐
           │  API Gateway      │
           │  (CORS + Auth)    │
           └─────────┬─────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│               APPLICATION LAYER                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   Auth   │ │Payments  │ │Travel    │ │Shopping  │      │
│  │  Module  │ │ Module   │ │ Module   │ │ Module   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│               DATA LAYER                                     │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ PostgreSQL       │  │ Redis            │               │
│  │ (Primary DB)     │  │ (Cache)          │               │
│  └──────────────────┘  └──────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Module Communication

```
User Registration
│
├─→ Auth Module (validate, create user)
│
├─→ Database Module (store user)
│
├─→ Wallet Module (create wallet)
│
├─→ KYC Module (initiate verification)
│
└─→ Response with JWT token
```

---

## 2. Database Design

### 2.1 Entity Relationship Diagram

```
┌─────────────┐
│    Users    │
├─────────────┤
│ id (PK)     │
│ phone       │
│ email       │
│ firstName   │
│ lastName    │
│ password    │
│ kycStatus   │
└──────┬──────┘
       │
       ├──────────────────┐
       │                  │
    1:1│                1:1│
       │                  │
    ┌──▼──────┐      ┌────▼──────┐
    │ Wallets  │      │   KYC     │
    ├──────────┤      ├───────────┤
    │ id (PK)  │      │ id (PK)   │
    │ userId   │      │ userId    │
    │ balance  │      │ docType   │
    │ status   │      │ status    │
    └──┬───────┘      └───────────┘
       │
    1:M│
       │
    ┌──▼────────────┐
    │ Transactions  │
    ├───────────────┤
    │ id (PK)       │
    │ userId        │
    │ amount        │
    │ type          │
    │ status        │
    │ module        │
    └───────────────┘
```

### 2.2 Key Relationships

- **Users → Wallets**: One-to-One (Each user has one wallet)
- **Users → Transactions**: One-to-Many (User has multiple transactions)
- **Users → KYC**: One-to-One (Each user has one KYC record)
- **Wallets → Transactions**: Implicit (via UserId)

---

## 3. Authentication & Security

### 3.1 Authentication Flow

```
1. User submits credentials
           ↓
2. Backend validates input
           ↓
3. Hash password & compare with stored hash
           ↓
4. Generate JWT token
           ↓
5. Return token to frontend
           ↓
6. Frontend stores token in localStorage
           ↓
7. Include token in all API requests
           ↓
8. Backend verifies token on each request
```

### 3.2 JWT Structure

```
Header: { alg: "HS256", typ: "JWT" }
Payload: { userId: "uuid", iat: timestamp, exp: timestamp }
Signature: HMACSHA256(header + payload + secret)
```

### 3.3 Security Best Practices

- Passwords hashed with bcryptjs (10 salts)
- JWT tokens expire after 7 days
- HTTPS enforcement (production)
- CORS configured for specific origins
- Helmet.js for HTTP headers security
- Input validation on all endpoints
- SQL injection protection via ORM

---

## 4. Payment Processing Module

### 4.1 Payment Flow

```
User initiates payment
        ↓
┌───────────────────────────────────┐
│ Validate payment details          │
│ - Amount check                    │
│ - Recipient verification          │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ Check wallet balance              │
│ - Insufficient balance check      │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ Debit from sender's wallet        │
│ Create debit transaction record   │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ Credit to recipient's wallet      │
│ Create credit transaction record  │
└────────────┬──────────────────────┘
             ↓
Return confirmation with reference ID
```

### 4.2 Transaction States

```
┌─────────────┐
│   PENDING   │
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
    SUCCESS        FAILED       REFUNDED
    (COMPLETED)
```

### 4.3 Wallet Operations

- **Add Money**: Credit external payment sources
- **Transfer**: P2P transfers within app
- **Withdraw**: Request funds to bank account
- **Refund**: Reverse a transaction

---

## 5. API Design Principles

### 5.1 RESTful Endpoints

```
Authentication:
  POST   /api/auth/register       - Register new user
  POST   /api/auth/login          - User login
  POST   /api/auth/refresh        - Refresh token

Payments:
  GET    /api/payments/wallet               - Get wallet details
  POST   /api/payments/wallet/add-money     - Add funds
  POST   /api/payments/transfer             - Send money
  GET    /api/payments/transactions         - Get history
  POST   /api/payments/kyc/submit           - Submit KYC
  POST   /api/payments/kyc/verify/:id       - Verify KYC

Users:
  GET    /api/users/profile               - Get profile
  PATCH  /api/users/profile               - Update profile
```

### 5.2 Response Format

```json
Success Response:
{
  "status": "success",
  "data": { ... },
  "message": "Operation successful"
}

Error Response:
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Invalid input",
  "errors": [...]
}

Paginated Response:
{
  "data": [...],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "pages": 5
  }
}
```

---

## 6. Frontend State Management

### 6.1 Context API Structure

```
AuthContext
├── user: { id, phone, firstName, ... }
├── token: JWT
├── isAuthenticated: boolean
├── login(phone, password)
├── register(userData)
└── logout()

PaymentContext (Future)
├── wallet: { balance, currency }
├── transactions: []
├── getWallet()
├── transfer()
└── addMoney()
```

### 6.2 Component Hierarchy

```
App
├── Router
│   ├── LoginPage (public)
│   ├── RegisterPage (public)
│   ├── DashboardPage (protected)
│   │   ├── WalletCard
│   │   ├── TransactionsList
│   │   ├── KYCForm
│   │   └── UserProfile
│   └── NotFound (404)
└── AuthProvider (wrapper)
```

---

## 7. Scalability Considerations

### 7.1 Database Optimization

- Indexing on frequently queried columns (phone, email, userId)
- Connection pooling (max 5 concurrent connections)
- Read replicas for analytics queries
- Sharding strategy for user data (future)

### 7.2 Caching Strategy

```
Redis Cache Layers
├── User Sessions (ttl: 24h)
├── Wallet Balance (ttl: 1m)
├── Transaction Cache (ttl: 5m)
└── KYC Status (ttl: 1h)
```

### 7.3 Load Balancing

- Nginx reverse proxy (production)
- Round-robin load distribution
- Health check endpoints
- Auto-scaling groups (Cloud)

---

## 8. Deployment Architecture

### 8.1 Development (Docker Compose)

```
┌──────────────────────────────────────┐
│         Docker Compose               │
├──────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────────┐ │
│ │ Backend     │ │ Frontend        │ │
│ │ (Port 5000) │ │ (Port 3000)     │ │
│ └─────────────┘ └─────────────────┘ │
│ ┌──────────────┐ ┌────────────────┐ │
│ │ PostgreSQL   │ │ Redis          │ │
│ │ (Port 5432)  │ │ (Port 6379)    │ │
│ └──────────────┘ └────────────────┘ │
└──────────────────────────────────────┘
```

### 8.2 Production Architecture

```
┌──────────────────────────────────────────────────────┐
│                 CDN / CloudFlare                     │
└────────────────────┬─────────────────────────────────┘
                     │
        ┌────────────▼──────────────┐
        │    Load Balancer          │
        │    (Nginx / ALB)          │
        └────────────┬──────────────┘
                     │
        ┌────────────┼──────────────┐
        │            │              │
    ┌───▼────┐   ┌──▼────┐   ┌────▼───┐
    │App 1   │   │App 2  │   │App 3   │
    └────┬───┘   └──┬────┘   └────┬───┘
         │          │             │
    ┌────▼──────────▼─────────────▼────┐
    │    PostgreSQL Cluster            │
    │    (Primary + Replicas)          │
    └─────────────────────────────────┘
         │         │          │
    ┌────▼─────────▼──────────▼────┐
    │    Redis Cluster             │
    │    (Sentinel + Replicas)     │
    └──────────────────────────────┘
```

---

## 9. Monitoring & Logging

### 9.1 Logging Strategy

```
Application Logs (Winston)
├── ERROR (fatal issues)
├── WARN (potential problems)
├── INFO (important events)
└── DEBUG (detailed traces)

Log Destinations
├── Console (development)
├── File: error.log
├── File: combined.log
└── ELK Stack (production)
```

### 9.2 Metrics to Monitor

- API response times
- Database query performance
- Cache hit ratio
- Error rates
- Active user sessions
- Transaction volumes
- Wallet balance anomalies

---

## 10. Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Travel module
- [ ] Shopping marketplace
- [ ] Home services
- [ ] Admin dashboard
- [ ] Advanced analytics
- [ ] ML-based fraud detection
- [ ] Blockchain for settlements
- [ ] International payments
- [ ] Insurance integration

---

**Last Updated:** May 2026
**Version:** 1.0.0
