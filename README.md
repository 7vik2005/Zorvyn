# Finance Dashboard Backend

A production-ready RESTful API backend for a personal finance dashboard — built with **Node.js**, **Express 5**, and **MongoDB**. It handles user authentication, financial record management (income/expenses), dashboard analytics via aggregation pipelines, and strict role-based access control.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture & Project Structure](#architecture--project-structure)
- [Setup & Installation](#setup--installation)
- [Seeding the Database](#seeding-the-database)
- [Running the Server](#running-the-server)
- [Environment Variables](#environment-variables)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [API Endpoints Summary](#api-endpoints-summary)
- [Security Features](#security-features)
- [Error Handling](#error-handling)
- [Database Design](#database-design)
- [Design Decisions & Trade-offs](#design-decisions--trade-offs)
- [Testing](#testing)
- [API Documentation](#api-documentation)

---

## Overview

This backend provides a complete financial management API. It supports:

- **User registration and authentication** with JWT-based token flow
- **CRUD operations on financial records** (income and expense entries)
- **Dashboard analytics** with real-time aggregation (totals, monthly trends, category breakdown, recent transactions)
- **Admin user management** (list, update roles/status, soft-delete users)
- **Rate limiting, input validation**, and **security hardening**

The codebase follows a clean **Controller → Service → Model** architecture with strict separation of concerns.

---

## Key Features

| Feature | Description |
|---|---|
| **JWT Authentication** | Stateless token-based auth with configurable expiry |
| **Role-Based Access Control** | Three distinct roles: `viewer`, `analyst`, `admin` |
| **Financial Records CRUD** | Create, read, update, and soft-delete income/expense records |
| **Dashboard Analytics** | MongoDB aggregation pipelines for totals, trends, breakdowns |
| **Search & Filtering** | Filter by type, category, date range; text search on notes |
| **Pagination** | Page-based pagination with configurable limits (max 100) |
| **Soft Deletes** | Data is never permanently destroyed — `isDeleted` flag architecture |
| **Rate Limiting** | Global API limit (100 req/15min) + strict auth limit (10 req/10min) |
| **Input Sanitization** | Regex escaping, type checking, length limits on all inputs |
| **Error Handling** | Global error handler with Mongoose, JWT, and validation error mapping |

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 18+ |
| Framework | Express.js | 5.x |
| Database | MongoDB | 6+ |
| ODM | Mongoose | 9.x |
| Auth | JSON Web Tokens (jsonwebtoken) | 9.x |
| Hashing | bcryptjs | 3.x |
| Rate Limiting | express-rate-limit | 8.x |
| CORS | cors | 2.x |
| Env Management | dotenv | 17.x |
| Dev Tools | nodemon | 3.x |

---

## Architecture & Project Structure

```
finance-dashboard-backend/
├── server.js                    # Entry point — starts Express + connects DB
├── package.json                 # Dependencies and scripts
├── .env                         # Environment variables (not committed)
├── .env.example                 # Template for environment variables
├── .gitignore                   # Git exclusions
├── README.md                    # This file
├── POSTMAN_TESTING.md           # Detailed Postman testing guide
├── API_DOCUMENTATION.md         # Full API reference documentation
│
└── src/
    ├── app.js                   # Express app configuration (middleware, routes, error handling)
    │
    ├── config/
    │   └── db.js                # MongoDB connection setup
    │
    ├── controllers/             # HTTP request/response handling
    │   ├── auth.controller.js   # Register, Login, Get Profile
    │   ├── user.controller.js   # List, Get, Update, Delete users
    │   ├── record.controller.js # CRUD financial records
    │   └── dashboard.controller.js  # Dashboard analytics
    │
    ├── middleware/               # Express middleware
    │   ├── auth.middleware.js    # JWT verification + user status checks
    │   ├── role.middleware.js    # Role-based authorization
    │   ├── error.middleware.js   # Global error handler
    │   └── rateLimit.middleware.js   # Rate limiters (API + auth)
    │
    ├── models/                  # Mongoose schemas
    │   ├── user.model.js        # User schema (name, email, password, role, status)
    │   └── record.model.js      # Financial record schema (amount, type, category, date)
    │
    ├── routes/                  # Express route definitions
    │   ├── auth.routes.js       # /api/auth/*
    │   ├── user.routes.js       # /api/users/*
    │   ├── record.routes.js     # /api/records/*
    │   └── dashboard.routes.js  # /api/dashboard/*
    │
    ├── services/                # Business logic layer
    │   ├── auth.service.js      # Registration, login, profile logic
    │   ├── user.service.js      # User CRUD with admin protections
    │   ├── record.service.js    # Record CRUD with filtering & validation
    │   └── dashboard.service.js # Aggregation pipeline logic
    │
    ├── utils/                   # Shared utilities
    │   ├── generateToken.js     # JWT token generation
    │   └── apiFeatures.js       # Reusable query builder (filter, search, sort, paginate)
    │
    └── scripts/
        └── seed.js              # Database seeder (creates test users + sample records)
```

### Layer Responsibilities

| Layer | Responsibility |
|---|---|
| **Routes** | Define HTTP endpoints, wire middleware and controllers |
| **Controllers** | Parse request, call service, format HTTP response |
| **Services** | Business logic, validations, database queries |
| **Models** | Schema definitions, pre-save hooks, instance/static methods |
| **Middleware** | Cross-cutting concerns (auth, authorization, errors, rate limiting) |

---

## Setup & Installation

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** database (local installation or [MongoDB Atlas](https://www.mongodb.com/atlas) cloud)
- **npm** (comes with Node.js)

### Step 1: Clone the Repository

```bash
git clone https://github.com/7vik2005/Zorvyn.git
cd finance-dashboard-backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Copy the example file and edit with your values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_secure_random_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

> **Important:** Generate a strong `JWT_SECRET` using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## Seeding the Database

The seed script populates the database with test users and sample financial records:

```bash
npm run seed
```

### What Gets Created

| User | Email | Password | Role |
|---|---|---|---|
| Admin User | `admin@zorvyn.com` | `admin123` | `admin` |
| Analyst User | `analyst@zorvyn.com` | `analyst123` | `analyst` |
| Viewer User | `viewer@zorvyn.com` | `viewer123` | `viewer` |

Plus **10 sample financial records** (income & expenses) for the admin user spanning January—March 2026.

> The seed script is idempotent — running it multiple times will not create duplicates.

---

## Running the Server

### Development Mode (auto-reload on file changes)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on the port specified in `.env` (default: `5000`).

You'll see output like:
```
Server running on port 5000
MongoDB Connected: <your-cluster-hostname>
```

### Verify the Server

```bash
curl http://localhost:5000/
```

Expected response:
```json
{
  "success": true,
  "message": "Finance Dashboard API is running",
  "version": "1.0.0"
}
```

---

## Environment Variables

| Variable | Description | Required | Default |
|---|---|---|---|
| `PORT` | Server port number | No | `5000` |
| `MONGO_URI` | MongoDB connection string | **Yes** | — |
| `JWT_SECRET` | Secret key for signing JWTs | **Yes** | — |
| `JWT_EXPIRE` | Token expiration duration | No | `7d` |
| `NODE_ENV` | Environment mode (`development`/`production`) | No | `development` |

---

## Role-Based Access Control (RBAC)

The system has three roles with distinct permission levels:

| Capability | Admin | Analyst | Viewer |
|---|:---:|:---:|:---:|
| Register / Login | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| View financial records | ✅ | ✅ | ✅ |
| Create financial records | ✅ | ❌ | ❌ |
| Edit financial records | ✅ | ❌ | ❌ |
| Delete financial records | ✅ | ❌ | ❌ |
| View dashboard analytics | ✅ | ✅ | ❌ |
| List all users | ✅ | ❌ | ❌ |
| Update user role/status | ✅ | ❌ | ❌ |
| Delete users | ✅ | ❌ | ❌ |

### Role Assignment Rules
- New user registration defaults to `viewer`
- Users can request `viewer` or `analyst` role during registration
- `admin` role can only be assigned by an existing admin via the user update API
- Self-role modification is blocked (admins cannot change their own role)
- The last active admin cannot be deleted (system lockout protection)

---

## API Endpoints Summary

### Health Check
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Public | API health check |

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Login and get JWT token |
| `GET` | `/api/auth/me` | Private | Get current user profile |

### Financial Records (`/api/records`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/records` | Private (All) | List records with filters & pagination |
| `POST` | `/api/records` | Private (Admin) | Create a new record |
| `PUT` | `/api/records/:id` | Private (Admin) | Update a record |
| `DELETE` | `/api/records/:id` | Private (Admin) | Soft delete a record |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard` | Private (Admin, Analyst) | Get dashboard analytics |

### User Management (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users` | Private (Admin) | List all users |
| `GET` | `/api/users/:id` | Private (Admin) | Get single user details |
| `PUT` | `/api/users/:id` | Private (Admin) | Update user role/status |
| `DELETE` | `/api/users/:id` | Private (Admin) | Soft delete a user |

> For complete request/response documentation with examples, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

---

## Security Features

| Feature | Implementation |
|---|---|
| **Password Hashing** | bcryptjs with salt rounds (10) — passwords never stored in plain text |
| **JWT Authentication** | Stateless tokens with configurable expiry |
| **Password Exclusion** | `select: false` on password field — never returned in API responses |
| **Token Validation** | Expired/invalid tokens return specific error messages |
| **Rate Limiting** | 100 requests per 15 min (general), 10 per 10 min (auth endpoints) |
| **Input Validation** | Type checking, length limits, enum validation on all inputs |
| **Regex Escaping** | Search queries are escaped to prevent ReDoS attacks |
| **JSON Body Limit** | Request bodies capped at 10KB to prevent payload-based DoS |
| **CORS** | Enabled for cross-origin requests |
| **Soft Deletes** | Users/records are never hard-deleted; `isDeleted` flag used |
| **Self-Modification Block** | Admins cannot change their own role or delete themselves |
| **Last Admin Protection** | The last active admin cannot be deleted |
| **Role Escalation Prevention** | Users cannot register as `admin` directly |

---

## Error Handling

The API uses a global error handler that produces consistent JSON responses:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "stack": "..." 
}
```

> The `stack` field only appears when `NODE_ENV=development`.

### Error Types Handled

| Error Type | Status Code | Description |
|---|---|---|
| Mongoose `CastError` | `400` | Invalid MongoDB ObjectId |
| Mongoose `ValidationError` | `400` | Schema validation failure |
| Duplicate Key (`11000`) | `409` | Unique constraint violation |
| `JsonWebTokenError` | `401` | Invalid token |
| `TokenExpiredError` | `401` | Expired token |
| Malformed JSON Body | `400` | Invalid JSON in request |
| Not Found | `404` | Route does not exist |
| Authorization | `403` | Insufficient role permissions |
| Rate Limit Exceeded | `429` | Too many requests |

---

## Database Design

### User Collection

| Field | Type | Constraints |
|---|---|---|
| `name` | String | Required, 2-50 chars, trimmed |
| `email` | String | Required, unique, lowercase, validated |
| `password` | String | Required, min 6 chars, hashed, `select: false` |
| `role` | String | Enum: `viewer`, `analyst`, `admin` (default: `viewer`) |
| `status` | String | Enum: `active`, `inactive` (default: `active`) |
| `lastLogin` | Date | Updated on successful login |
| `isDeleted` | Boolean | Soft delete flag (default: `false`, `select: false`) |
| `createdAt` | Date | Auto-generated |
| `updatedAt` | Date | Auto-generated |

### Record Collection

| Field | Type | Constraints |
|---|---|---|
| `user` | ObjectId (ref: User) | Required, indexed |
| `amount` | Number | Required, min: 0 |
| `type` | String | Enum: `income`, `expense`, required |
| `category` | String | Required, trimmed, lowercase |
| `date` | Date | Required, indexed |
| `note` | String | Optional, max 200 chars, trimmed |
| `isDeleted` | Boolean | Soft delete flag (default: `false`, `select: false`) |
| `createdAt` | Date | Auto-generated |
| `updatedAt` | Date | Auto-generated |

### Indexes

| Collection | Index | Purpose |
|---|---|---|
| User | `{ email: 1 }` | Fast email lookups, uniqueness |
| User | `{ role: 1 }` | Role-based filtering |
| Record | `{ user: 1, date: -1 }` | User's records sorted by date |
| Record | `{ user: 1, type: 1 }` | Dashboard aggregation by type |
| Record | `{ user: 1, category: 1 }` | Category-based queries |

---

## Design Decisions & Trade-offs

### 1. Soft Deletes vs Hard Deletes
Data is never permanently destroyed. Both User and Record models use an `isDeleted` boolean flag. This allows data recovery, audit trails, and prevents accidental data loss. The trade-off is slightly more complex queries (every query must filter `isDeleted: false`).

### 2. Controller → Service Separation
HTTP-level concerns (parsing requests, forming responses) live in controllers. Business logic, validation rules, and database queries live in services. This makes the business logic testable independently and follows the Single Responsibility Principle.

### 3. Compound Indexes
MongoDB aggregation pipelines for the dashboard would scan all documents without proper indexes. Compound indexes on `(user, date)`, `(user, type)`, and `(user, category)` ensure queries remain fast as data grows to millions of records.

### 4. JWT in Authorization Header (Not Cookies)
Tokens are passed via `Authorization: Bearer <token>` header. This approach is stateless, works across different domains (no cookie CORS issues), and is the standard for API backends consumed by multiple clients.

### 5. Rate Limiting at Two Levels
The general API limiter (100 req/15min) protects against abuse. The auth-specific limiter (10 req/10min) provides additional protection against brute-force login attempts.

### 6. Registration Role Restriction
Users cannot self-assign the `admin` role during registration. This prevents privilege escalation. Only existing admins can promote users via the user update endpoint.

---

## Testing

For a comprehensive guide on testing every API endpoint manually using Postman — including edge cases, error scenarios, and the recommended testing order — refer to:

📋 **[POSTMAN_TESTING.md](./POSTMAN_TESTING.md)** — Step-by-step Postman testing walkthrough

📖 **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** — Full API reference with request/response schemas

---

## Scripts Reference

| Command | Description |
|---|---|
| `npm run dev` | Start server with nodemon (auto-reload) |
| `npm start` | Start server in production mode |
| `npm run seed` | Seed database with test users and sample records |
