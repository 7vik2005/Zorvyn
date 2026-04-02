# Finance Dashboard Backend

A robust, scalable backend for a finance dashboard system built with Node.js, Express, and MongoDB. This system provides APIs for managing users, tracking financial records (income/expenses), and computing dashboard summaries, with strict role-based access control.

## Overview

This project is structured systematically to demonstrate clean backend architecture, separation of concerns, and security best practices.

### Key Features
* **Role-Based Access Control (RBAC):** Distinct roles (`viewer`, `analyst`, `admin`) with strict permission boundaries.
* **Security:** JWT authentication, password hashing (bcrypt), and rate limiting.
* **Data Integrity:** Solid Mongoose models with validation and data normalization.
* **Aggregation:** Complex MongoDB aggregation pipelines for computing real-time dashboard statistics.
* **Error Handling:** Global structured error handler and detailed error responses.

## Technology Stack
* **Runtime:** Node.js
* **Framework:** Express.js (v5)
* **Database:** MongoDB + Mongoose
* **Authentication:** JSON Web Tokens (JWT) & bcryptjs
* **Security:** express-rate-limit, cors

## Project Structure
```
src/
├── config/       # Database connection setup
├── controllers/  # Request/response handling logic
├── middleware/   # Auth, roles, error handling, rate limiting
├── models/       # Mongoose database schemas
├── routes/       # Express route definitions
├── scripts/      # Database seeding scripts
├── services/     # Core business logic and database queries
└── utils/        # Shared utilities (API features, tokens)
```

## Setup & Installation

### 1. Prerequisites
* Node.js (v18+ recommended)
* MongoDB database (local or Atlas)

### 2. Clone and Install
```bash
git clone https://github.com/7vik2005/Zorvyn.git
cd finance-dashboard-backend
npm install
```

### 3. Environment Variables
Copy the example environment file and update the values:
```bash
cp .env.example .env
```

Your `.env` should look like this:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

### 4. Seed Initial Data
Run the seed script to create initial test users and sample records:
```bash
npm run seed
```
This script creates:
* **Admin User:** `admin@zorvyn.com` / `admin123`
* **Analyst User:** `analyst@zorvyn.com` / `analyst123`
* **Viewer User:** `viewer@zorvyn.com` / `viewer123`
* 10 sample financial records for the admin user.

### 5. Start Server
**Development Mode (auto-reloads):**
```bash
npm run dev
```
**Production Mode:**
```bash
npm start
```

## Role Permissions Overview

| Feature | Admin | Analyst | Viewer |
|---------|-------|---------|--------|
| **View Records** | Yes | Yes | Yes |
| **Create/Edit/Delete Records**| Yes | No | No |
| **View Dashboard Summary** | Yes | Yes | No |
| **Manage Users** | Yes | No | No |

## API Endpoints Summary

### Authentication (`/api/auth`)
* `POST /register` - Register a new user
* `POST /login` - Login to get JWT
* `GET /me` - Get current user profile

### Financial Records (`/api/records`)
* `GET /` - List records (supports search, filter, pagination)
* `POST /` - Create a record (Admin only)
* `PUT /:id` - Update a record (Admin only)
* `DELETE /:id` - Soft delete a record (Admin only)

### Dashboard (`/api/dashboard`)
* `GET /` - Get aggregated dashboard metrics (Admin/Analyst only)

### User Management (`/api/users`)
* `GET /` - List all users (Admin only)
* `GET /:id` - Get specific user (Admin only)
* `PUT /:id` - Update user role & status (Admin only)
* `DELETE /:id` - Soft delete user (Admin only)

## Design Decisions & Trade-offs
1. **Soft Deletes vs. Hard Deletes:** Data is never permanently destroyed. A boolean `isDeleted` flag is used on both User and Record collections to allow data recovery and audit history.
2. **Controller/Service Separation:** Request payload validation and HTTP response mapping happens in the controller. Database queries and core business rules are strictly inside the service layer, making the code testable and reusable.
3. **Compound Indexes:** Heavy queries like dashboard aggregation use Mongoose indexes `(user, date)` and `(user, type)` to maintain performance as data grows.

## Testing
Refer to [POSTMAN_TESTING.md](./POSTMAN_TESTING.md) for a complete guide on how to test every API endpoint manually using Postman, including sample data and the proper testing order.
