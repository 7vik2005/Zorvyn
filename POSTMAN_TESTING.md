# Postman Testing Guide — Finance Dashboard Backend

A comprehensive, step-by-step guide for testing **every** API endpoint using Postman. This covers happy paths, error cases, edge cases, and role-based access restrictions.

---

## Prerequisites

Before starting, ensure:

1. **Server is running**: `npm run dev` (runs on `http://localhost:5000`)
2. **Database is seeded**: `npm run seed`
3. **Postman** is installed ([download](https://www.postman.com/downloads/))

### Base URL
```
http://localhost:5000
```

### Test Credentials (from seed)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@zorvyn.com` | `admin123` |
| Analyst | `analyst@zorvyn.com` | `analyst123` |
| Viewer | `viewer@zorvyn.com` | `viewer123` |

---

## Setting Up Postman

### Creating an Environment

1. Click **Environments** → **Create Environment**
2. Add variables:
   - `BASE_URL` = `http://localhost:5000`
   - `ADMIN_TOKEN` = (will be set after login)
   - `ANALYST_TOKEN` = (will be set after login)
   - `VIEWER_TOKEN` = (will be set after login)

### Authorization Setup

For authenticated requests:
1. Go to the **Authorization** tab
2. Select **Bearer Token**
3. Paste the token from the login response

---

## Test Flow (Recommended Order)

Follow this order to properly test all features:

1. Health Check
2. Authentication (Register → Login → Profile)
3. Records (Create → Read → Update → Delete)
4. Dashboard
5. User Management
6. Edge Cases & Error Scenarios

---

## 1. Health Check

### 1.1 API Health Check

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{BASE_URL}}/` |
| Auth | None |

**Expected Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Finance Dashboard API is running",
  "version": "1.0.0"
}
```

### 1.2 Test 404 Handler

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{BASE_URL}}/api/nonexistent` |
| Auth | None |

**Expected Response** (`404 Not Found`):
```json
{
  "success": false,
  "message": "Route not found: GET /api/nonexistent"
}
```

---

## 2. Authentication

### 2.1 Register a New User (Happy Path)

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{BASE_URL}}/api/auth/register` |
| Auth | None |
| Body | JSON (raw) |

**Request Body:**
```json
{
  "name": "Test User",
  "email": "testuser@zorvyn.com",
  "password": "password123",
  "role": "viewer"
}
```

**Expected Response** (`201 Created`):
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "_id": "...",
    "name": "Test User",
    "email": "testuser@zorvyn.com",
    "role": "viewer",
    "status": "active",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### 2.2 Register — Duplicate Email (Error)

Repeat the same request as 2.1.

**Expected Response** (`400 Bad Request`):
```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

### 2.3 Register — Missing Fields (Error)

**Request Body:**
```json
{
  "name": "No Password User",
  "email": "nopw@zorvyn.com"
}
```

**Expected Response** (`400 Bad Request`):
```json
{
  "success": false,
  "message": "Name, email, and password are required"
}
```

### 2.4 Register — Short Password (Error)

**Request Body:**
```json
{
  "name": "Short Password",
  "email": "short@zorvyn.com",
  "password": "123"
}
```

**Expected Response** (`400 Bad Request`):
```json
{
  "success": false,
  "message": "Password must be at least 6 characters long"
}
```

### 2.5 Register — Invalid Email (Error)

**Request Body:**
```json
{
  "name": "Bad Email",
  "email": "not-an-email",
  "password": "password123"
}
```

**Expected Response** (`400 Bad Request`):
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

### 2.6 Register — Attempt Admin Role (Edge Case)

**Request Body:**
```json
{
  "name": "Sneaky Admin",
  "email": "sneaky@zorvyn.com",
  "password": "password123",
  "role": "admin"
}
```

**Expected Response** (`201 Created` — but role is `viewer`, not `admin`):
```json
{
  "success": true,
  "data": {
    "role": "viewer"
  }
}
```

### 2.7 Register — Name Too Short (Edge Case)

**Request Body:**
```json
{
  "name": "A",
  "email": "short@zorvyn.com",
  "password": "password123"
}
```

**Expected Response** (`400 Bad Request`):
```json
{
  "success": false,
  "message": "Name must be at least 2 characters"
}
```

### 2.8 Register — Empty Whitespace Name (Edge Case)

**Request Body:**
```json
{
  "name": "   ",
  "email": "blank@zorvyn.com",
  "password": "password123"
}
```

**Expected Response** (`400 Bad Request`):
```json
{
  "success": false,
  "message": "Name must be at least 2 characters"
}
```

---

### 2.9 Login as Admin

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{BASE_URL}}/api/auth/login` |
| Body | JSON (raw) |

**Request Body:**
```json
{
  "email": "admin@zorvyn.com",
  "password": "admin123"
}
```

**Expected Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "_id": "...",
    "name": "Admin User",
    "email": "admin@zorvyn.com",
    "role": "admin",
    "status": "active"
  }
}
```

> **Action:** Save the `token` value as `ADMIN_TOKEN`.

### 2.10 Login as Analyst

**Request Body:**
```json
{
  "email": "analyst@zorvyn.com",
  "password": "analyst123"
}
```

> **Action:** Save the `token` value as `ANALYST_TOKEN`.

### 2.11 Login as Viewer

**Request Body:**
```json
{
  "email": "viewer@zorvyn.com",
  "password": "viewer123"
}
```

> **Action:** Save the `token` value as `VIEWER_TOKEN`.

### 2.12 Login — Wrong Password (Error)

**Request Body:**
```json
{
  "email": "admin@zorvyn.com",
  "password": "wrongpassword"
}
```

**Expected Response** (`401 Unauthorized`):
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 2.13 Login — Non-Existent Email (Error)

**Request Body:**
```json
{
  "email": "ghost@zorvyn.com",
  "password": "password123"
}
```

**Expected Response** (`401 Unauthorized`):
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 2.14 Login — Missing Fields (Error)

**Request Body:**
```json
{
  "email": "admin@zorvyn.com"
}
```

**Expected Response** (`401 Unauthorized`):
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

---

### 2.15 Get Current User Profile

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{BASE_URL}}/api/auth/me` |
| Auth | Bearer Token (`ADMIN_TOKEN`) |

**Expected Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Admin User",
    "email": "admin@zorvyn.com",
    "role": "admin",
    "status": "active",
    "lastLogin": "..."
  }
}
```

### 2.16 Get Profile — No Token (Error)

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{BASE_URL}}/api/auth/me` |
| Auth | None |

**Expected Response** (`401 Unauthorized`):
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 2.17 Get Profile — Invalid Token (Error)

| Field | Value |
|---|---|
| Auth | Bearer Token: `invalid.token.here` |

**Expected Response** (`401 Unauthorized`):
```json
{
  "success": false,
  "message": "Invalid token."
}
```

---

## 3. Financial Records

> **Use Admin token** for create/update/delete operations.

### 3.1 Create a Record (Happy Path)

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{BASE_URL}}/api/records` |
| Auth | Bearer Token (`ADMIN_TOKEN`) |
| Body | JSON (raw) |

**Request Body:**
```json
{
  "amount": 2500,
  "type": "income",
  "category": "freelance",
  "date": "2026-04-10T00:00:00Z",
  "note": "Web design contract payment"
}
```

**Expected Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Record created successfully",
  "data": {
    "_id": "...",
    "user": "...",
    "amount": 2500,
    "type": "income",
    "category": "freelance",
    "date": "2026-04-10T00:00:00.000Z",
    "note": "Web design contract payment",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

> **Action:** Copy the `_id` for update/delete tests.

### 3.2 Create Record — Amount Zero (Edge Case)

**Request Body:**
```json
{
  "amount": 0,
  "type": "expense",
  "category": "adjustment",
  "date": "2026-04-01T00:00:00Z",
  "note": "Zero adjustment entry"
}
```

**Expected Response** (`201 Created`) — amount 0 should be accepted.

### 3.3 Create Record — Missing Fields (Error)

**Request Body:**
```json
{
  "amount": 500
}
```

**Expected Response** (`400 Bad Request`):
```json
{
  "success": false,
  "message": "Type, category, and date are required"
}
```

### 3.4 Create Record — Negative Amount (Error)

**Request Body:**
```json
{
  "amount": -100,
  "type": "expense",
  "category": "test",
  "date": "2026-04-01T00:00:00Z"
}
```

**Expected Response** (`400 Bad Request`):
```json
{
  "success": false,
  "message": "Amount cannot be negative"
}
```

### 3.5 Create Record — Invalid Type (Error)

**Request Body:**
```json
{
  "amount": 100,
  "type": "transfer",
  "category": "test",
  "date": "2026-04-01T00:00:00Z"
}
```

**Expected Response** (`400 Bad Request`):
```json
{
  "success": false,
  "message": "Invalid record type. Must be 'income' or 'expense'"
}
```

### 3.6 Create Record — Invalid Date (Error)

**Request Body:**
```json
{
  "amount": 100,
  "type": "income",
  "category": "test",
  "date": "not-a-date"
}
```

**Expected Response** (`400 Bad Request`):
```json
{
  "success": false,
  "message": "Invalid date format"
}
```

### 3.7 Create Record — Note Too Long (Error)

**Request Body:**
```json
{
  "amount": 100,
  "type": "income",
  "category": "test",
  "date": "2026-04-01T00:00:00Z",
  "note": "This note is intentionally made very long to exceed the two hundred character limit that is enforced by the backend validation. This should trigger an error because the note field has a maximum length of two hundred characters only."
}
```

**Expected Response** (`400 Bad Request`):
```json
{
  "success": false,
  "message": "Note cannot exceed 200 characters"
}
```

### 3.8 Create Record — Viewer Token (Role Restriction)

| Field | Value |
|---|---|
| Auth | Bearer Token (`VIEWER_TOKEN`) |

**Request Body:** Same as 3.1.

**Expected Response** (`403 Forbidden`):
```json
{
  "success": false,
  "message": "Access denied. Role 'viewer' is not permitted."
}
```

### 3.9 Create Record — Analyst Token (Role Restriction)

| Field | Value |
|---|---|
| Auth | Bearer Token (`ANALYST_TOKEN`) |

**Request Body:** Same as 3.1.

**Expected Response** (`403 Forbidden`):
```json
{
  "success": false,
  "message": "Access denied. Role 'analyst' is not permitted."
}
```

---

### 3.10 List Records — Basic

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{BASE_URL}}/api/records` |
| Auth | Bearer Token (any role) |

**Expected Response** (`200 OK`):
```json
{
  "success": true,
  "total": 10,
  "page": 1,
  "pages": 1,
  "count": 10,
  "data": [ ... ]
}
```

### 3.11 List Records — With Pagination

| Field | Value |
|---|---|
| URL | `{{BASE_URL}}/api/records?page=1&limit=3` |

**Expected:** Returns 3 records with `pages` calculated correctly.

### 3.12 List Records — Filter by Type

| Field | Value |
|---|---|
| URL | `{{BASE_URL}}/api/records?type=income` |

**Expected:** Only records with `type: "income"`.

### 3.13 List Records — Filter by Category

| Field | Value |
|---|---|
| URL | `{{BASE_URL}}/api/records?category=salary` |

**Expected:** Only records with `category: "salary"`.

### 3.14 List Records — Filter by Date Range

| Field | Value |
|---|---|
| URL | `{{BASE_URL}}/api/records?startDate=2026-02-01&endDate=2026-02-28` |

**Expected:** Only records from February 2026.

### 3.15 List Records — Search by Note

| Field | Value |
|---|---|
| URL | `{{BASE_URL}}/api/records?search=salary` |

**Expected:** Records whose note or category contains "salary".

### 3.16 List Records — Invalid Page Number (Edge Case)

| Field | Value |
|---|---|
| URL | `{{BASE_URL}}/api/records?page=-1&limit=abc` |

**Expected:** Should not crash. Falls back to `page=1, limit=10`.

### 3.17 List Records — Large Limit (Edge Case)

| Field | Value |
|---|---|
| URL | `{{BASE_URL}}/api/records?limit=999` |

**Expected:** Limit is clamped to `100`.

### 3.18 List Records — Regex Special Characters in Search (Edge Case)

| Field | Value |
|---|---|
| URL | `{{BASE_URL}}/api/records?search=.*` |

**Expected:** Should not crash. Special characters are escaped.

---

### 3.19 Update a Record

| Field | Value |
|---|---|
| Method | `PUT` |
| URL | `{{BASE_URL}}/api/records/<RECORD_ID>` |
| Auth | Bearer Token (`ADMIN_TOKEN`) |

**Request Body:**
```json
{
  "amount": 3000,
  "note": "Updated payment amount"
}
```

**Expected Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Record updated successfully",
  "data": {
    "amount": 3000,
    "note": "Updated payment amount"
  }
}
```

### 3.20 Update Record — Empty Body (Edge Case)

**Request Body:**
```json
{}
```

**Expected Response** (`200 OK`) — returns the unchanged record.

### 3.21 Update Record — Invalid ID (Error)

| Field | Value |
|---|---|
| URL | `{{BASE_URL}}/api/records/invalid-id-here` |

**Expected Response** (`400 Bad Request`):
```json
{
  "success": false,
  "message": "Invalid record ID"
}
```

### 3.22 Update Record — Non-Existent ID (Error)

| Field | Value |
|---|---|
| URL | `{{BASE_URL}}/api/records/507f1f77bcf86cd799439011` |

**Expected Response** (`400 Bad Request`):
```json
{
  "success": false,
  "message": "Record not found or unauthorized"
}
```

---

### 3.23 Delete a Record

| Field | Value |
|---|---|
| Method | `DELETE` |
| URL | `{{BASE_URL}}/api/records/<RECORD_ID>` |
| Auth | Bearer Token (`ADMIN_TOKEN`) |

**Expected Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Record deleted successfully"
}
```

### 3.24 Delete — Already Deleted Record (Error)

Repeat the same DELETE request.

**Expected Response** (`400 Bad Request`):
```json
{
  "success": false,
  "message": "Record not found or unauthorized"
}
```

### 3.25 Delete — Verify Soft Delete

After deleting, `GET /api/records` — the deleted record should NOT appear in the list.

---

## 4. Dashboard

### 4.1 Get Dashboard — Admin

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{BASE_URL}}/api/dashboard` |
| Auth | Bearer Token (`ADMIN_TOKEN`) |

**Expected Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "totals": {
      "income": 15800,
      "expense": 4300,
      "balance": 11500
    },
    "categoryBreakdown": [
      {
        "_id": { "category": "salary", "type": "income" },
        "total": 15000
      }
    ],
    "monthlyTrends": [
      {
        "_id": { "year": 2026, "month": 1, "type": "income" },
        "total": 5000
      }
    ],
    "recentTransactions": [ ... ]
  }
}
```

### 4.2 Get Dashboard — Analyst (Allowed)

| Field | Value |
|---|---|
| Auth | Bearer Token (`ANALYST_TOKEN`) |

**Expected Response** (`200 OK`) — same structure, but for the analyst's records (likely empty if no records were created for the analyst).

### 4.3 Get Dashboard — Viewer (Forbidden)

| Field | Value |
|---|---|
| Auth | Bearer Token (`VIEWER_TOKEN`) |

**Expected Response** (`403 Forbidden`):
```json
{
  "success": false,
  "message": "Access denied. Role 'viewer' is not permitted."
}
```

---

## 5. User Management

> All user management endpoints require **Admin** role.

### 5.1 List All Users

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{BASE_URL}}/api/users` |
| Auth | Bearer Token (`ADMIN_TOKEN`) |

**Expected Response** (`200 OK`):
```json
{
  "success": true,
  "total": 4,
  "page": 1,
  "pages": 1,
  "count": 4,
  "data": [ ... ]
}
```

### 5.2 List Users — Filter by Role

| Field | Value |
|---|---|
| URL | `{{BASE_URL}}/api/users?role=viewer` |

**Expected:** Only users with role `viewer`.

### 5.3 List Users — Filter by Status

| Field | Value |
|---|---|
| URL | `{{BASE_URL}}/api/users?status=active` |

### 5.4 List Users — Search

| Field | Value |
|---|---|
| URL | `{{BASE_URL}}/api/users?search=analyst` |

**Expected:** Users whose name or email contains "analyst".

### 5.5 List Users — Pagination

| Field | Value |
|---|---|
| URL | `{{BASE_URL}}/api/users?page=1&limit=2` |

### 5.6 List Users — Viewer Token (Forbidden)

| Field | Value |
|---|---|
| Auth | Bearer Token (`VIEWER_TOKEN`) |

**Expected Response** (`403 Forbidden`).

### 5.7 List Users — Analyst Token (Forbidden)

| Field | Value |
|---|---|
| Auth | Bearer Token (`ANALYST_TOKEN`) |

**Expected Response** (`403 Forbidden`).

---

### 5.8 Get Single User

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{BASE_URL}}/api/users/<USER_ID>` |
| Auth | Bearer Token (`ADMIN_TOKEN`) |

**Expected Response** (`200 OK`) with user details.

### 5.9 Get User — Invalid ID (Error)

| Field | Value |
|---|---|
| URL | `{{BASE_URL}}/api/users/invalid-id` |

**Expected Response** (`400 Bad Request` or `500`) with error message.

---

### 5.10 Update User Role

| Field | Value |
|---|---|
| Method | `PUT` |
| URL | `{{BASE_URL}}/api/users/<VIEWER_USER_ID>` |
| Auth | Bearer Token (`ADMIN_TOKEN`) |

**Request Body:**
```json
{
  "role": "analyst"
}
```

**Expected Response** (`200 OK`):
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "role": "analyst"
  }
}
```

### 5.11 Update User Status

**Request Body:**
```json
{
  "status": "inactive"
}
```

**Expected Response** (`200 OK`).

### 5.12 Update User — Invalid Role (Error)

**Request Body:**
```json
{
  "role": "superadmin"
}
```

**Expected Response** (`500` or `400`):
```json
{
  "success": false,
  "message": "Invalid role. Must be 'viewer', 'analyst', or 'admin'"
}
```

### 5.13 Update User — Self-Modification (Error)

| Field | Value |
|---|---|
| URL | `{{BASE_URL}}/api/users/<ADMIN_USER_ID>` |

**Request Body:**
```json
{
  "role": "viewer"
}
```

**Expected Response** (`500` or `400`):
```json
{
  "success": false,
  "message": "You cannot modify your own role/status"
}
```

---

### 5.14 Delete User

| Field | Value |
|---|---|
| Method | `DELETE` |
| URL | `{{BASE_URL}}/api/users/<TEST_USER_ID>` |
| Auth | Bearer Token (`ADMIN_TOKEN`) |

**Expected Response** (`200 OK`):
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### 5.15 Delete User — Self-Delete (Error)

| Field | Value |
|---|---|
| URL | `{{BASE_URL}}/api/users/<ADMIN_USER_ID>` |

**Expected Response** (`500` or `400`):
```json
{
  "success": false,
  "message": "You cannot delete your own account"
}
```

### 5.16 Delete User — Last Admin (Error)

If the admin user is the only admin, attempting to delete any route that would result in zero admins:

**Expected Response** (`500` or `400`):
```json
{
  "success": false,
  "message": "Cannot delete the last active admin. Promote another user to admin first."
}
```

### 5.17 Delete — Already Deleted User (Error)

Repeat delete on the same user.

**Expected Response** (`500` or `400`):
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## 6. Additional Edge Cases

### 6.1 Rate Limiting

Make more than 10 login requests within 10 minutes.

**Expected Response** (`429 Too Many Requests`):
```json
{
  "success": false,
  "message": "Too many login attempts. Try again later."
}
```

### 6.2 Large JSON Payload

Send a request body larger than 10KB:

**Expected Response** (`413 Payload Too Large` or `400`).

### 6.3 Malformed JSON Body

Send invalid JSON:
```
{ "amount": 100, invalid }
```

**Expected Response** (`400 Bad Request`):
```json
{
  "success": false,
  "message": "Invalid JSON in request body"
}
```

### 6.4 Expired Token

Use an expired JWT token.

**Expected Response** (`401 Unauthorized`):
```json
{
  "success": false,
  "message": "Token expired. Please login again."
}
```

### 6.5 Request Without Content-Type Header

Send a POST request without `Content-Type: application/json`.

**Expected:** Should handle gracefully (empty body treated as missing fields).

---

## Summary of Expected Error Codes

| Status Code | Meaning | When |
|---|---|---|
| `200` | Success | Successful read/update/delete |
| `201` | Created | Successful creation |
| `400` | Bad Request | Validation errors, invalid IDs |
| `401` | Unauthorized | Missing/invalid/expired token |
| `403` | Forbidden | Insufficient role permissions |
| `404` | Not Found | Route doesn't exist |
| `409` | Conflict | Duplicate key (e.g., duplicate email) |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Server Error | Unexpected internal errors |
