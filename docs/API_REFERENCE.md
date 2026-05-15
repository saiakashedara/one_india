# API Reference

## Base URL
- Production: `https://api.oneindia.com/api`
- Development: `http://localhost:5000/api`

## Authentication

All authenticated requests require JWT token in Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Endpoints

### Health Check

#### Get Health Status
```
GET /health

Response:
200 OK
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Authentication Module (`/auth`)

### Register

```
POST /auth/register

Request:
{
  "phone": "9876543210",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "language": "en"
}

Response:
201 Created
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phone": "9876543210",
    "firstName": "John",
    "lastName": "Doe",
    "language": "en"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Errors:
400 Bad Request - Validation failed
{
  "errors": [
    {
      "msg": "Invalid phone number",
      "param": "phone"
    }
  ]
}
```

### Login

```
POST /auth/login

Request:
{
  "phone": "9876543210",
  "password": "SecurePass123"
}

Response:
200 OK
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phone": "9876543210",
    "firstName": "John",
    "lastName": "Doe",
    "kycStatus": "pending"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Errors:
401 Unauthorized
{
  "message": "Invalid credentials"
}
```

### Refresh Token

```
POST /auth/refresh

Request:
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}

Response:
200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Errors:
401 Unauthorized
{
  "message": "User not found"
}
```

---

## Payments Module (`/payments`)

### Get Wallet

```
GET /payments/wallet

Headers:
Authorization: Bearer <TOKEN>

Response:
200 OK
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "balance": 5000.00,
  "currency": "INR",
  "walletStatus": "active",
  "totalRewarded": 250.00,
  "lastTransactionDate": "2024-01-15T09:30:00Z"
}

Errors:
401 Unauthorized
{
  "message": "Invalid token"
}
404 Not Found
{
  "message": "Wallet not found"
}
```

### Add Money

```
POST /payments/wallet/add-money

Headers:
Authorization: Bearer <TOKEN>
Content-Type: application/json

Request:
{
  "amount": 500,
  "paymentMethod": "card"
}

Response:
200 OK
{
  "transaction": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "transactionType": "credit",
    "amount": 500.00,
    "status": "completed",
    "module": "payments",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "wallet": {
    "balance": 5500.00,
    "currency": "INR"
  }
}

Errors:
400 Bad Request
{
  "message": "Invalid amount"
}
```

### Transfer Money

```
POST /payments/transfer

Headers:
Authorization: Bearer <TOKEN>
Content-Type: application/json

Request:
{
  "recipientPhone": "9876543211",
  "amount": 100,
  "description": "Payment for services"
}

Response:
200 OK
{
  "referenceId": "TRANSFER_550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "message": "Transfer successful",
  "newBalance": 5400.00
}

Errors:
400 Bad Request
{
  "message": "Insufficient balance"
}
{
  "message": "Recipient not found"
}
{
  "message": "Cannot transfer to yourself"
}
```

### Get Transactions

```
GET /payments/transactions

Headers:
Authorization: Bearer <TOKEN>

Query Parameters:
?limit=20&offset=0&module=payments&status=completed

Response:
200 OK
{
  "transactions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "transactionType": "credit",
      "amount": 500.00,
      "status": "completed",
      "module": "payments",
      "description": "Money added via card",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}

Errors:
401 Unauthorized
404 Not Found
```

### Submit KYC

```
POST /payments/kyc/submit

Headers:
Authorization: Bearer <TOKEN>
Content-Type: application/json

Request:
{
  "documentType": "aadhaar",
  "documentNumber": "123456789012",
  "documentImageUrl": "https://storage.example.com/kyc/123.jpg"
}

Response:
201 Created
{
  "kycId": "550e8400-e29b-41d4-a716-446655440003",
  "status": "pending",
  "message": "KYC submitted for verification"
}

Errors:
400 Bad Request
{
  "message": "KYC already verified"
}
```

### Verify KYC

```
POST /payments/kyc/verify/:kycId

Headers:
Content-Type: application/json

Request:
{
  "status": "verified",
  "rejectionReason": null
}

Response:
200 OK
{
  "kycId": "550e8400-e29b-41d4-a716-446655440003",
  "status": "verified",
  "message": "KYC verified"
}

Errors:
400 Bad Request
{
  "message": "KYC record not found"
}
```

---

## Users Module (`/users`)

### Get Profile

```
GET /users/profile

Headers:
Authorization: Bearer <TOKEN>

Response:
200 OK
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phone": "9876543210",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "language": "en",
    "kycStatus": "pending",
    "createdAt": "2024-01-15T08:00:00Z"
  },
  "wallet": {
    "balance": 5400.00,
    "currency": "INR",
    "status": "active"
  },
  "kyc": {
    "documentType": "aadhaar",
    "verificationStatus": "pending"
  }
}

Errors:
401 Unauthorized
404 Not Found
```

### Update Profile

```
PATCH /users/profile

Headers:
Authorization: Bearer <TOKEN>
Content-Type: application/json

Request:
{
  "firstName": "Jonathan",
  "lastName": "Smith",
  "email": "jonathan@example.com",
  "language": "hi"
}

Response:
200 OK
{
  "message": "Profile updated",
  "user": {
    "firstName": "Jonathan",
    "lastName": "Smith",
    "email": "jonathan@example.com",
    "language": "hi"
  }
}

Errors:
401 Unauthorized
400 Bad Request
{
  "message": "Invalid input"
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Validation failed |
| 401 | Unauthorized - Invalid/missing token |
| 404 | Not Found - Resource doesn't exist |
| 422 | Unprocessable Entity - Logic validation failed |
| 500 | Internal Server Error |

---

## Rate Limiting

- API endpoints are rate-limited to 100 requests per minute per IP
- Headers included in response:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: 95
  - `X-RateLimit-Reset`: 1642261200

---

## Pagination

For endpoints returning lists:

```
Query Parameters:
?limit=20&offset=0

Response:
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

## Supported Languages

- `en` - English
- `hi` - Hindi
- `ta` - Tamil
- `te` - Telugu
- `kn` - Kannada
- `ml` - Malayalam

---

## Status Enums

### Transaction Status
- `pending` - Awaiting processing
- `completed` - Successfully processed
- `failed` - Processing failed
- `refunded` - Refunded to user

### KYC Status
- `pending` - Awaiting verification
- `verified` - KYC approved
- `rejected` - KYC rejected

### Wallet Status
- `active` - Wallet operational
- `frozen` - Temporarily frozen
- `suspended` - Suspended due to fraud/violations

---

**Last Updated:** January 2024
**Version:** 1.0.0
