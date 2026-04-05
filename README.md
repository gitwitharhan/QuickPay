<div align="center">

# ⚡ QuickPay

### A production-ready, full-stack digital payment platform built with Node.js, React, MongoDB, and Upstash Redis.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Vercel-black?style=for-the-badge)](https://quick-pay-silk.vercel.app)
[![Backend API](https://img.shields.io/badge/🚀_Backend_API-Render-46E3B7?style=for-the-badge)](https://quickpay-7rda.onrender.com)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?style=for-the-badge&logo=redis)](https://upstash.com)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Live Links](#-live-links)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [System Account Seed](#system-account-seed)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
  - [Auth Endpoints](#-auth-endpoints)
  - [Account Endpoints](#-account-endpoints)
  - [Transaction Endpoints](#-transaction-endpoints)
- [Authentication Flow](#-authentication-flow)
- [Session Management with Redis](#-session-management-with-redis)
- [Transaction Engine](#-transaction-engine)
- [Data Models](#-data-models)
- [Security](#-security)
- [Deployment](#-deployment)

---

## 🌟 Overview

QuickPay is a **full-stack fintech platform** simulating a real-world payment system. It supports multi-wallet accounts, peer-to-peer fund transfers, a system-level admin account for dispatching initial funds, and a real-time transaction ledger with expandable receipts.

Built with production concerns in mind:
- **Atomic transactions** using MongoDB sessions and `withTransaction`
- **Idempotency keys** preventing double-charging on retries
- **Single active session** enforcement via Upstash Redis
- **JWT + HttpOnly cookie** authentication
- **Email notifications** via Nodemailer for all transaction events

---

## 🔗 Live Links

| Service | URL |
|---|---|
| 🌐 Frontend (Vercel) | [quick-pay-silk.vercel.app](https://quick-pay-silk.vercel.app) |
| 🚀 Backend API (Render) | [quickpay-7rda.onrender.com](https://quickpay-7rda.onrender.com) |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Vercel)                             │
│   React + Vite + TailwindCSS                                        │
│   ┌─────────────────┐   ┌──────────────────┐   ┌────────────────┐  │
│   │   AuthContext   │   │  UserDashboard   │   │  API Services  │  │
│   │  (JWT + Cookie) │   │  (Overview/Txns) │   │ (fetch + CORS) │  │
│   └────────┬────────┘   └────────┬─────────┘   └───────┬────────┘  │
└────────────┼────────────────────┼─────────────────────┼────────────┘
             │   HTTPS + Cookies  │                      │
             ▼                    ▼                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       BACKEND (Render)                              │
│   Express.js + TypeScript                                           │
│   ┌──────────────┐  ┌────────────────┐  ┌──────────────────────┐  │
│   │  Auth Routes │  │ Account Routes │  │  Transaction Routes  │  │
│   └──────┬───────┘  └───────┬────────┘  └──────────┬───────────┘  │
│          │                  │                       │              │
│   ┌──────▼──────────────────▼───────────────────────▼───────────┐  │
│   │              Auth & SystemUser Middleware                    │  │
│   │   JWT Verify → Redis Token Check → User Lookup              │  │
│   └──────────────────────────────────────────────────────────────┘  │
└──────────────┬──────────────────────────────┬──────────────────────┘
               │                              │
    ┌──────────▼───────────┐    ┌─────────────▼──────────┐
    │   MongoDB (Atlas)    │    │  Upstash Redis          │
    │  Users, Accounts,    │    │  Active Session Store   │
    │  Transactions,       │    │  Key: user:{id}         │
    │  Ledger, Blacklist   │    │  TTL: 3 days            │
    └──────────────────────┘    └────────────────────────┘
```

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js 22 + Express.js 5** | HTTP server & routing |
| **TypeScript 6** | Type-safe backend |
| **MongoDB Atlas + Mongoose 9** | Primary database (ODM) |
| **Upstash Redis** | Single active session enforcement |
| **JSON Web Tokens (JWT)** | Stateless authentication |
| **bcrypt** | Password hashing |
| **Nodemailer** | Transaction email notifications |
| **tsx** | TypeScript execution (no compile step) |
| **nodemon** | Dev hot-reloading |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18 + Vite** | SPA framework & build tool |
| **TailwindCSS** | Utility-first styling |
| **React Router v6** | Client-side routing |
| **Context API** | Global auth state management |
| **Fetch API** | HTTP client |

### Infrastructure
| Service | Purpose |
|---|---|
| **Render** | Backend hosting |
| **Vercel** | Frontend hosting |
| **MongoDB Atlas** | Managed database |
| **Upstash** | Managed Redis |

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login/register with HttpOnly cookie tokens
- 🔄 **Single Active Session** — Upstash Redis invalidates old sessions on new login
- 💳 **Multi-Wallet Support** — Users can create multiple accounts/wallets
- 💸 **P2P Transfers** — Send funds between any two accounts by account ID
- 🧾 **Double-Entry Ledger** — Every transaction creates debit + credit ledger entries
- 🔑 **Idempotency Keys** — Prevents duplicate transactions on client retries
- ⚛️ **Atomic Transactions** — MongoDB sessions with `withTransaction` for rollback safety
- 📊 **Transaction Ledger UI** — Expandable receipt view with full metadata
- 📈 **Monthly Spend Analytics** — Trend comparison against prior month
- 📧 **Email Notifications** — Automatic emails to both sender and receiver
- 👑 **System User** — Admin-level account for dispatching initial funds to new users
- 🌐 **CORS-Ready** — Properly configured for cross-domain Vercel ↔ Render communication

---

## 📁 Project Structure

```
QuickPay/
├── backend/
│   ├── server.ts                        # Entry point
│   ├── seedSystemAccount.ts             # System user seed script
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── app.ts                       # Express app + CORS + routes
│       ├── config/
│       │   ├── db.ts                    # MongoDB connection
│       │   ├── nodemailer.ts            # Email transport config
│       │   └── redis.config.ts          # Upstash Redis client
│       ├── models/
│       │   ├── user.model.ts            # User schema
│       │   ├── account.model.ts         # Account schema + getBalance()
│       │   ├── transaction.model.ts     # Transaction schema
│       │   ├── ledger.model.ts          # Double-entry ledger schema
│       │   └── blackList.model.ts       # JWT token blacklist schema
│       ├── controllers/
│       │   ├── auth.controller.ts       # register, login, logout
│       │   ├── account.controller.ts    # createAccount, getUserAccounts, getAccountDetailsById
│       │   └── transaction.controller.ts # createTransaction, createInitialTransaction, getAllTransactions
│       ├── middleware/
│       │   ├── auth.middleware.ts       # JWT + Redis session validation
│       │   └── systemUserAuth.middleware.ts # System-only route guard
│       └── routes/
│           ├── auth.routes.ts
│           ├── account.routes.ts
│           └── transaction.routes.ts
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── .env
    └── src/
        ├── main.jsx                     # App entry
        ├── App.jsx                      # Router setup
        ├── context/
        │   └── AuthContext.jsx          # Global auth state (login/logout/register)
        ├── api/
        │   ├── baseUrl.js               # Dynamic base URL (dev vs production)
        │   ├── authService.js           # Login, register, logout
        │   ├── accountService.js        # Fetch accounts, details, create
        │   └── transactionService.js    # Create tx, initial tx, get all
        ├── pages/
        │   ├── UserDashboard.jsx        # Main app dashboard
        │   └── LoginPage.jsx / RegisterPage.jsx
        └── components/
            ├── Sidebar.jsx
            ├── StatCard.jsx
            └── AbstractLogo.jsx
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)
- Upstash Redis account → [upstash.com](https://upstash.com)
- A Gmail account (for Nodemailer)

---

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/gitwitharhan/QuickPay.git
cd QuickPay/backend

# Install dependencies
npm install

# Create your .env (see Environment Variables section)
cp .env.example .env

# Start dev server
npm run dev
```

The backend will start at `http://localhost:3000`.

---

### Frontend Setup

```bash
cd QuickPay/frontend

# Install dependencies
npm install

# Create your .env
cp .env.example .env

# Start dev server
npm run dev
```

The frontend will start at `http://localhost:5173`.

---

### System Account Seed

QuickPay has a special **system user** that can dispatch initial funds to new users. To seed this account:

```bash
cd backend
npm run seed:system
```

This creates a user with `systemUser: true` and an associated account. Log in with the system credentials and use the **"Force Dispatch"** form on the dashboard to credit any account.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/quickpay

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Upstash Redis
REDIS_URL=https://your-instance.upstash.io
REDIS_TOKEN=your_upstash_token

# Email (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# App
PORT=3000
NODE_ENV=development
```

### Frontend (`frontend/.env`)

```env
# For production: your Render backend URL
# For local dev: http://localhost:3000
VITE_BACKEND_URL=https://quickpay-7rda.onrender.com

# System user email to identify admin in UI
VITE_SYSTEM_EMAIL=su@gmail.com
```

> ⚠️ **Vercel** — Add these as Environment Variables in your Vercel project settings. The `.env` file is gitignored and won't be pushed.

---

## 📡 API Reference

> **Base URL:** `https://quickpay-7rda.onrender.com`
>
> All protected routes require a valid JWT sent either as:
> - **HttpOnly Cookie:** `token=<jwt>` (automatically sent by browser)
> - **Authorization Header:** `Authorization: Bearer <jwt>`

---

### 🔑 Auth Endpoints

#### `POST /api/auth/register`

Register a new user and receive a JWT token.

**Request Body:**
```json
{
  "name": "Arhan Alam",
  "email": "arhan@example.com",
  "password": "securepassword123"
}
```

**Success Response `201`:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "682abc123...",
    "name": "Arhan Alam",
    "email": "arhan@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Behavior:**
- Hashes password with bcrypt (10 salt rounds)
- Signs a JWT valid for **3 days**
- Sets an HttpOnly cookie `token`
- Stores session token in **Upstash Redis** under key `user:{id}` with 3-day TTL

**Errors:**
| Status | Message |
|---|---|
| `400` | `"Email already in use"` |
| `500` | `"Server error during registration"` |

---

#### `POST /api/auth/login`

Authenticate an existing user.

**Request Body:**
```json
{
  "email": "arhan@example.com",
  "password": "securepassword123"
}
```

**Success Response `200`:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "682abc123...",
    "name": "Arhan Alam",
    "email": "arhan@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Behavior:**
- Validates credentials via bcrypt comparison
- Signs a fresh JWT (3-day expiry)
- **Overwrites** the existing Redis session → old device is immediately invalidated
- Sets HttpOnly cookie

**Errors:**
| Status | Message |
|---|---|
| `400` | `"Invalid email or password"` |
| `500` | `"Server error during login"` |

---

#### `POST /api/auth/logout`

Invalidate the current session.

**Headers:** Cookie or Bearer token required.

**Success Response `200`:**
```json
{
  "message": "Logout successful"
}
```

**Behavior:**
- Decodes the JWT to extract `userId`
- **Deletes** Redis key `user:{userId}` — future requests with this token return `401`
- Saves token to `TokenBlacklist` collection in MongoDB
- Clears `token` cookie

---

### 💳 Account Endpoints

> All routes require `authenticate` middleware (JWT + Redis session check).

---

#### `POST /api/account/createAccount`

Create a new INR wallet for the authenticated user.

**Headers:** Cookie or Bearer token.

**Request Body:** _(none required)_

**Success Response `201`:**
```json
{
  "message": "Account created successfully",
  "account": {
    "_id": "683xyz789...",
    "user": "682abc123...",
    "status": "active",
    "currency": "INR",
    "createdAt": "2026-04-05T00:00:00.000Z"
  }
}
```

**Errors:**
| Status | Message |
|---|---|
| `401` | `"No token provided"` |
| `401` | `"Session expired or logged in from another device"` |
| `500` | `"Server error while creating account"` |

---

#### `GET /api/account/allAccounts`

Fetch all accounts belonging to the authenticated user, including **live calculated balance**.

**Headers:** Cookie or Bearer token.

**Success Response `200`:**
```json
{
  "accounts": [
    {
      "_id": "683xyz789...",
      "user": "682abc123...",
      "status": "active",
      "currency": "INR",
      "balance": 15000.00,
      "createdAt": "2026-04-05T00:00:00.000Z"
    }
  ]
}
```

> **Note:** `balance` is dynamically computed from ledger entries (credits - debits), not stored as a field.

---

#### `GET /api/account/:accountId`

Get details and live balance for a specific account.

**URL Params:**
| Param | Type | Description |
|---|---|---|
| `accountId` | `string` | MongoDB ObjectId of the account |

**Success Response `200`:**
```json
{
  "account": {
    "_id": "683xyz789...",
    "user": "682abc123...",
    "status": "active",
    "currency": "INR"
  },
  "balance": 15000.00
}
```

**Errors:**
| Status | Message |
|---|---|
| `404` | `"Account not found"` |
| `500` | `"Server error while fetching account details"` |

---

### 💸 Transaction Endpoints

---

#### `POST /api/transaction/create`

Transfer funds from one account to another. Protected by `authenticate` middleware.

**Headers:** Cookie or Bearer token.

**Request Body:**
```json
{
  "fromAccount": "683xyz789...",
  "toAccount": "683abc456...",
  "amount": 5000,
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000",
  "description": "Rent payment for April"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `fromAccount` | `string` | ✅ | ObjectId of sender's account |
| `toAccount` | `string` | ✅ | ObjectId of receiver's account |
| `amount` | `number` | ✅ | Amount in INR (min: 0.01) |
| `idempotencyKey` | `string` | ✅ | UUID to prevent duplicate transactions |
| `description` | `string` | ✅ | Human-readable note for the transaction |

**Success Response `201`:**
```json
{
  "message": "Transaction completed successfully",
  "transaction": {
    "_id": "684txn001...",
    "fromAccount": "683xyz789...",
    "toAccount": "683abc456...",
    "amount": 5000,
    "status": "completed",
    "description": "Rent payment for April",
    "idempotencyKey": "550e8400-...",
    "createdAt": "2026-04-05T18:00:00.000Z"
  }
}
```

**10-Step Transaction Flow:**
```
1. Validate required fields
2. Verify both accounts exist and are active
3. Check idempotency key — return existing tx if duplicate
4. Calculate sender balance from ledger
5. Verify sufficient funds
6. START MongoDB session
7.   Create Transaction document (status: "pending")
8.   Create Debit ledger entry for sender
9.   Create Credit ledger entry for receiver
10.  Update Transaction status to "completed"
    COMMIT session (auto-retry on write conflicts)
11. Send email notifications to sender + receiver
```

**Errors:**
| Status | Message |
|---|---|
| `400` | `"Missing required fields"` |
| `400` | `"Both accounts must be active"` |
| `400` | `"Insufficient funds"` |
| `404` | `"One or both accounts not found"` |
| `200` | `"Transaction already completed"` (idempotency) |
| `200` | `"Transaction is in progress"` (idempotency) |
| `500` | `"transaction is pending pls try after sometime"` |

---

#### `POST /api/transaction/initial`

Dispatch initial funds from the system account to a user's account. Protected by `authenticateSystemUser` middleware — **only the system admin can call this**.

**Headers:** Cookie or Bearer token of the system user.

**Request Body:**
```json
{
  "toAccount": "683xyz789...",
  "amount": 10000,
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440001",
  "description": "Welcome bonus — QuickPay"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `toAccount` | `string` | ✅ | ObjectId of recipient account |
| `amount` | `number` | ✅ | Amount to credit (INR) |
| `idempotencyKey` | `string` | ✅ | UUID |
| `description` | `string` | ❌ | Optional note |

**Success Response `201`:**
```json
{
  "message": "Initial transaction completed successfully",
  "transaction": {
    "_id": "684txn002...",
    "fromAccount": "<system_account_id>",
    "toAccount": "683xyz789...",
    "amount": 10000,
    "status": "completed",
    "description": "Welcome bonus — QuickPay"
  }
}
```

> ⚠️ This endpoint **bypasses balance validation** for the system account, allowing it to credit unlimited funds.

**Errors:**
| Status | Message |
|---|---|
| `400` | `"Missing required fields"` |
| `400` | `"Account must be active"` |
| `403` | `"Access denied"` (non-system user) |
| `404` | `"Account not found"` |
| `500` | `"System user not found"` |
| `500` | `"System user account not found"` |

---

#### `GET /api/transaction/all`

Fetch all transactions where the authenticated user's accounts appear as either sender or receiver.

**Headers:** Cookie or Bearer token.

**Success Response `200`:**
```json
{
  "transactions": [
    {
      "_id": "684txn001...",
      "fromAccount": {
        "_id": "683xyz789...",
        "user": {
          "name": "Arhan Alam",
          "email": "arhan@example.com",
          "systemUser": false
        }
      },
      "toAccount": {
        "_id": "683abc456...",
        "user": {
          "name": "Jane Doe",
          "email": "jane@example.com"
        }
      },
      "amount": 5000,
      "status": "completed",
      "description": "Rent payment for April",
      "idempotencyKey": "550e8400-...",
      "createdAt": "2026-04-05T18:00:00.000Z"
    }
  ]
}
```

> Results are sorted by `createdAt` descending (newest first). Both `fromAccount` and `toAccount` are populated with user details.

---

## 🔒 Authentication Flow

```
Client                          Backend                        Redis
  │                                │                              │
  │──── POST /api/auth/login ──────►│                              │
  │                                │── Verify password ──────────►│
  │                                │── Sign JWT ─────────────────►│
  │                                │── redis.set(user:{id}, token)►│
  │◄─── Set-Cookie: token ─────────│                              │
  │                                │                              │
  │──── GET /api/account/* ────────►│                              │
  │     Cookie: token=<jwt>         │── jwt.verify(token) ────────►│
  │                                │── redis.get(user:{id}) ──────►│
  │                                │◄─ "stored_token" ────────────│
  │                                │── Compare tokens ────────────│
  │                                │   ✅ Match → continue        │
  │◄─── 200 OK ────────────────────│   ❌ Mismatch → 401         │
```

---

## 🔴 Session Management with Redis

QuickPay uses **Upstash Redis** to enforce a single active session per user:

| Event | Redis Action |
|---|---|
| **Login / Register** | `SET user:{id} <token> EX 259200` (3 days) |
| **Every Request** | `GET user:{id}` → compare with incoming token |
| **Login from new device** | Overwrites old token → old session becomes invalid |
| **Logout** | `DEL user:{id}` → token immediately invalid |
| **Token mismatch** | Returns `401 "Session expired or logged in from another device"` |

---

## ⚙️ Transaction Engine

### Double-Entry Ledger

Every transaction creates **two** ledger entries ensuring accounting accuracy:

```
Transaction: Arhan sends ₹5,000 to Jane
─────────────────────────────────────────
Ledger Entry 1:  account=Arhan  type=DEBIT   amount=5000
Ledger Entry 2:  account=Jane   type=CREDIT  amount=5000
─────────────────────────────────────────
Arhan balance = Σ(credits) - Σ(debits) = -5000
Jane balance  = Σ(credits) - Σ(debits) = +5000
```

### Idempotency

Every transaction requires a unique `idempotencyKey` (UUID). If the same key is submitted again:

| Existing Status | Response |
|---|---|
| `completed` | `200` — Returns the existing transaction |
| `pending` | `200` — Informs client that it's in progress |
| `failed` | `200` — Advises to retry |
| `reversed` | `200` — Advises to retry |

### Atomic Sessions

Transactions use `session.withTransaction()` which provides:
- ✅ Automatic retry on `WriteConflict` errors
- ✅ Full rollback if any step fails
- ✅ ACID-compliant multi-document operations

---

## 🗄 Data Models

### User
| Field | Type | Notes |
|---|---|---|
| `name` | `String` | Required |
| `email` | `String` | Unique, lowercase |
| `password` | `String` | bcrypt hashed, `select: false` |
| `systemUser` | `Boolean` | `select: false`, default `false` |

### Account
| Field | Type | Notes |
|---|---|---|
| `user` | `ObjectId → User` | Required |
| `status` | `active \| inactive` | Default `active` |
| `currency` | `String` | Default `INR` |
| `balance` | _computed_ | Via `getBalance()` from Ledger |

### Transaction
| Field | Type | Notes |
|---|---|---|
| `fromAccount` | `ObjectId → Account` | Required, indexed |
| `toAccount` | `ObjectId → Account` | Required, indexed |
| `amount` | `Number` | Min 0.01 |
| `status` | `pending\|completed\|failed\|reversed` | Default `pending` |
| `idempotencyKey` | `String` | Unique, indexed |
| `description` | `String` | Required |

### Ledger
| Field | Type | Notes |
|---|---|---|
| `account` | `ObjectId → Account` | Required |
| `transaction` | `ObjectId → Transaction` | Required |
| `type` | `debit \| credit` | Required |
| `amount` | `Number` | Required |

---

## 🛡 Security

| Feature | Implementation |
|---|---|
| Password hashing | bcrypt (10 rounds) |
| Authentication | JWT (3-day expiry) |
| Cookie security | `httpOnly: true`, `secure: true` in production, `sameSite: strict` |
| Token blacklisting | MongoDB `TokenBlacklist` collection on logout |
| Session invalidation | Upstash Redis single-session enforcement |
| CORS | Whitelist of allowed origins only |
| System user isolation | Separate middleware, `systemUser` flag hidden from normal queries |

---

## 🚢 Deployment

### Render (Backend)

| Setting | Value |
|---|---|
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |
| **Runtime** | Node.js 22 |

**Required env vars on Render:**
```
MONGO_URI, JWT_SECRET, REDIS_URL, REDIS_TOKEN, EMAIL_USER, EMAIL_PASS, NODE_ENV=production
```

### Vercel (Frontend)

Vercel auto-detects Vite. Just connect the repo.

**Required env vars on Vercel:**
```
VITE_BACKEND_URL=https://quickpay-7rda.onrender.com
VITE_SYSTEM_EMAIL=su@gmail.com
```

---

<div align="center">

Built with ❤️ by [Arhan Alam](https://github.com/gitwitharhan)

⭐ **Star this repo if you found it useful!**

</div>
