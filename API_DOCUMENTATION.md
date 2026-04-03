# API Documentation — Finance Dashboard Backend

Complete reference for all API endpoints, including request/response schemas, authentication details, query parameters, and error responses.

---

## Base URL

```
http://localhost:5000
```

## Authentication

All private endpoints require a JWT token sent via the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are obtained via the `/api/auth/login` or `/api/auth/register` endpoints.

### Token Details

| Property | Value |
|---|---|
| Type | JWT (JSON Web Token) |
| Algorithm | HS256 |
| Expiry | Configurable via `JWT_EXPIRE` env var (default: `7d`) |
| Payload | `{ "id": "<user_mongo_id>", "iat": ..., "exp": ... }` |

---

## Response Format

All responses follow a consistent JSON structure:

### Success Response
```json
{
  "success": true,
  "message": "Optional success message",
  "data": { ... },
  "token": "..."
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "stack": "..." 
}
```

> The `stack` field only appears when `NODE_ENV=development`.

### Paginated Response
```json
{
  "success": true,
  "total": 50,
  "page": 1,
  "pages": 5,
  "count": 10,
  "data": [ ... ]
}
```

| Field | Type | Description |
|---|---|---|
| `total` | Number | Total number of matching documents |
| `page` | Number | Current page number |
| `pages` | Number | Total number of pages |
| `count` | Number | Number of documents in current page |
| `data` | Array | Array of documents |

---

## HTTP Status Codes

| Code | Meaning | Usage |
|---|---|---|
| `200` | OK | Successful GET, PUT, DELETE |
| `201` | Created | Successful POST (resource created) |
| `400` | Bad Request | Validation errors, invalid input |
| `401` | Unauthorized | Missing, invalid, or expired token |
| `403` | Forbidden | Insufficient role permissions |
| `404` | Not Found | Route does not exist |
| `409` | Conflict | Duplicate key violation |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server failure |

---

## Rate Limiting

| Limiter | Scope | Window | Max Requests |
|---|---|---|---|
| General API | All routes | 15 minutes | 100 |
| Auth | `/api/auth/login`, `/api/auth/register` | 10 minutes | 10 |

When rate limited, the response is:
```json
{
  "success": false,
  "message": "Too many requests. Please try again later."
}
```

Standard rate limit headers are included:
- `RateLimit-Limit`
- `RateLimit-Remaining`
- `RateLimit-Reset`

---

# Endpoints

## 1. Health Check

### `GET /`

Check if the API is running.

**Authentication:** None

**Response** (`200`):
```json
{
  "success": true,
  "message": "Finance Dashboard API is running",
  "version": "1.0.0"
}
```

---

## 2. Authentication (`/api/auth`)

### `POST /api/auth/register`

Register a new user account.

**Authentication:** None  
**Rate Limit:** Auth limiter (10 req / 10 min)

#### Request Body

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `name` | String | **Yes** | 2–50 chars, trimmed | User's full name |
| `email` | String | **Yes** | Valid email format | User's email address |
| `password` | String | **Yes** | Min 6 chars | Account password |
| `role` | String | No | `viewer` or `analyst` only | Desired role (defaults to `viewer`) |

> **Note:** Setting `role: "admin"` is silently ignored. The role will default to `viewer`.

#### Success Response (`201`)

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "660a1b2c3d4e5f6a7b8c9d0e",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "viewer",
    "status": "active",
    "createdAt": "2026-04-01T12:00:00.000Z",
    "updatedAt": "2026-04-01T12:00:00.000Z"
  }
}
```

#### Error Responses

| Status | Message | Cause |
|---|---|---|
| `400` | `Name, email, and password are required` | Missing required fields |
| `400` | `Name, email, and password must be strings` | Invalid field types |
| `400` | `Name must be at least 2 characters` | Name too short or whitespace-only |
| `400` | `Name cannot exceed 50 characters` | Name too long |
| `400` | `Invalid email format` | Malformed email |
| `400` | `Password must be at least 6 characters long` | Weak password |
| `400` | `User already exists with this email` | Duplicate email |

---

### `POST /api/auth/login`

Authenticate a user and receive a JWT token.

**Authentication:** None  
**Rate Limit:** Auth limiter (10 req / 10 min)

#### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | String | **Yes** | Registered email address |
| `password` | String | **Yes** | Account password |

#### Success Response (`200`)

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "660a1b2c3d4e5f6a7b8c9d0e",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "viewer",
    "status": "active",
    "lastLogin": "2026-04-03T16:00:00.000Z",
    "createdAt": "2026-04-01T12:00:00.000Z",
    "updatedAt": "2026-04-03T16:00:00.000Z"
  }
}
```

#### Error Responses

| Status | Message | Cause |
|---|---|---|
| `401` | `Email and password are required` | Missing fields |
| `401` | `Email and password must be strings` | Invalid types |
| `401` | `Invalid email format` | Malformed email |
| `401` | `Invalid email or password` | Wrong email or password |
| `401` | `Your account is inactive. Contact admin.` | Account deactivated |

> **Security:** The same error message `Invalid email or password` is returned whether the email doesn't exist or the password is wrong. This prevents user enumeration.

---

### `GET /api/auth/me`

Get the currently authenticated user's profile.

**Authentication:** Required (Bearer Token)

#### Success Response (`200`)

```json
{
  "success": true,
  "data": {
    "_id": "660a1b2c3d4e5f6a7b8c9d0e",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "viewer",
    "status": "active",
    "lastLogin": "2026-04-03T16:00:00.000Z",
    "createdAt": "2026-04-01T12:00:00.000Z",
    "updatedAt": "2026-04-03T16:00:00.000Z"
  }
}
```

#### Error Responses

| Status | Message | Cause |
|---|---|---|
| `401` | `Access denied. No token provided.` | No Authorization header |
| `401` | `Invalid token.` | Malformed token |
| `401` | `Token expired. Please login again.` | Expired JWT |
| `404` | `User not found` | User deleted or doesn't exist |

---

## 3. Financial Records (`/api/records`)

### `GET /api/records`

List financial records for the authenticated user with optional filtering, search, and pagination.

**Authentication:** Required (Bearer Token)  
**Roles:** All (`viewer`, `analyst`, `admin`)

#### Query Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | Number | `1` | Page number (min: 1) |
| `limit` | Number | `10` | Records per page (min: 1, max: 100) |
| `type` | String | — | Filter by record type: `income` or `expense` |
| `category` | String | — | Filter by exact category (case-insensitive) |
| `startDate` | String (ISO) | — | Filter records on or after this date |
| `endDate` | String (ISO) | — | Filter records on or before this date |
| `search` | String | — | Search in `note` and `category` fields (max 100 chars) |
| `sort` | String | `-date` | Sort field. Prefix with `-` for descending. Allowed: `date`, `amount`, `type`, `category`, `createdAt` |

#### Examples

```
GET /api/records?type=income&page=1&limit=5
GET /api/records?category=salary&startDate=2026-01-01&endDate=2026-03-31
GET /api/records?search=rent&sort=-amount
```

#### Success Response (`200`)

```json
{
  "success": true,
  "total": 10,
  "page": 1,
  "pages": 2,
  "count": 5,
  "data": [
    {
      "_id": "660a1b2c3d4e5f6a7b8c9d0e",
      "user": "660a0a1b2c3d4e5f6a7b8c9d",
      "amount": 5000,
      "type": "income",
      "category": "salary",
      "date": "2026-03-15T00:00:00.000Z",
      "note": "March salary",
      "createdAt": "2026-03-15T12:00:00.000Z",
      "updatedAt": "2026-03-15T12:00:00.000Z"
    }
  ]
}
```

---

### `POST /api/records`

Create a new financial record.

**Authentication:** Required (Bearer Token)  
**Roles:** `admin` only

#### Request Body

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `amount` | Number | **Yes** | ≥ 0 | Transaction amount |
| `type` | String | **Yes** | `income` or `expense` | Record type |
| `category` | String | **Yes** | Non-empty, trimmed | Category label |
| `date` | String (ISO) | **Yes** | Valid date | Transaction date |
| `note` | String | No | Max 200 chars | Optional description |

#### Request Example

```json
{
  "amount": 2500,
  "type": "income",
  "category": "Freelance",
  "date": "2026-04-10T00:00:00Z",
  "note": "Web design contract"
}
```

#### Success Response (`201`)

```json
{
  "success": true,
  "message": "Record created successfully",
  "data": {
    "_id": "660b2c3d4e5f6a7b8c9d0e1f",
    "user": "660a0a1b2c3d4e5f6a7b8c9d",
    "amount": 2500,
    "type": "income",
    "category": "freelance",
    "date": "2026-04-10T00:00:00.000Z",
    "note": "Web design contract",
    "createdAt": "2026-04-03T16:00:00.000Z",
    "updatedAt": "2026-04-03T16:00:00.000Z"
  }
}
```

> **Note:** The `category` is automatically converted to lowercase.

#### Error Responses

| Status | Message | Cause |
|---|---|---|
| `400` | `Amount is required` | Amount not provided |
| `400` | `Type, category, and date are required` | Missing required fields |
| `400` | `Amount must be a valid number` | Non-numeric amount |
| `400` | `Amount cannot be negative` | Negative amount |
| `400` | `Invalid record type. Must be 'income' or 'expense'` | Invalid type value |
| `400` | `Category must be a non-empty string` | Empty category |
| `400` | `Invalid date format` | Unparseable date |
| `400` | `Note must be a string` | Non-string note |
| `400` | `Note cannot exceed 200 characters` | Note too long |
| `403` | `Access denied. Role '...' is not permitted.` | Non-admin role |

---

### `PUT /api/records/:id`

Update an existing financial record.

**Authentication:** Required (Bearer Token)  
**Roles:** `admin` only

#### URL Parameters

| Parameter | Type | Description |
|---|---|---|
| `id` | String | MongoDB ObjectId of the record |

#### Request Body

All fields are optional. Only provided fields will be updated.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `amount` | Number | ≥ 0 | Updated amount |
| `type` | String | `income` or `expense` | Updated type |
| `category` | String | Non-empty | Updated category |
| `date` | String (ISO) | Valid date | Updated date |
| `note` | String | Max 200 chars | Updated note |

#### Request Example

```json
{
  "amount": 3000,
  "note": "Updated payment amount"
}
```

#### Success Response (`200`)

```json
{
  "success": true,
  "message": "Record updated successfully",
  "data": {
    "_id": "660b2c3d4e5f6a7b8c9d0e1f",
    "amount": 3000,
    "note": "Updated payment amount"
  }
}
```

#### Error Responses

| Status | Message | Cause |
|---|---|---|
| `400` | `Invalid record ID` | Malformed ObjectId |
| `400` | `Record not found or unauthorized` | Record doesn't exist or belongs to another user |
| `400` | `Amount must be a valid number` | Non-numeric amount |
| `400` | `Amount cannot be negative` | Negative amount |
| `400` | `Invalid type. Must be 'income' or 'expense'` | Invalid type |
| `400` | `Category must be a non-empty string` | Empty category |
| `400` | `Invalid date format` | Unparseable date |
| `400` | `Note cannot exceed 200 characters` | Note too long |

---

### `DELETE /api/records/:id`

Soft delete a financial record. The record is marked as deleted but not removed from the database.

**Authentication:** Required (Bearer Token)  
**Roles:** `admin` only

#### URL Parameters

| Parameter | Type | Description |
|---|---|---|
| `id` | String | MongoDB ObjectId of the record |

#### Success Response (`200`)

```json
{
  "success": true,
  "message": "Record deleted successfully"
}
```

#### Error Responses

| Status | Message | Cause |
|---|---|---|
| `400` | `Invalid record ID` | Malformed ObjectId |
| `400` | `Record not found or unauthorized` | Record doesn't exist, already deleted, or belongs to another user |

---

## 4. Dashboard (`/api/dashboard`)

### `GET /api/dashboard`

Get aggregated dashboard analytics for the authenticated user.

**Authentication:** Required (Bearer Token)  
**Roles:** `analyst`, `admin`

#### Success Response (`200`)

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
        "_id": {
          "category": "salary",
          "type": "income"
        },
        "total": 15000
      },
      {
        "_id": {
          "category": "rent",
          "type": "expense"
        },
        "total": 2400
      },
      {
        "_id": {
          "category": "freelance",
          "type": "income"
        },
        "total": 800
      }
    ],
    "monthlyTrends": [
      {
        "_id": {
          "year": 2026,
          "month": 1,
          "type": "income"
        },
        "total": 5000
      },
      {
        "_id": {
          "year": 2026,
          "month": 1,
          "type": "expense"
        },
        "total": 1500
      }
    ],
    "recentTransactions": [
      {
        "_id": "660b2c3d4e5f6a7b8c9d0e1f",
        "amount": 5000,
        "type": "income",
        "category": "salary",
        "date": "2026-03-15T00:00:00.000Z",
        "note": "March salary"
      }
    ]
  }
}
```

#### Response Data Schema

| Field | Type | Description |
|---|---|---|
| `totals.income` | Number | Sum of all income records |
| `totals.expense` | Number | Sum of all expense records |
| `totals.balance` | Number | `income - expense` |
| `categoryBreakdown` | Array | Totals grouped by category and type, sorted by amount descending |
| `monthlyTrends` | Array | Totals grouped by year, month, and type, sorted chronologically |
| `recentTransactions` | Array | Last 5 transactions sorted by date descending |

#### Error Responses

| Status | Message | Cause |
|---|---|---|
| `403` | `Access denied. Role 'viewer' is not permitted.` | Viewer role |
| `500` | `Failed to fetch dashboard data` | Server error |

---

## 5. User Management (`/api/users`)

### `GET /api/users`

List all users with optional filtering, search, and pagination.

**Authentication:** Required (Bearer Token)  
**Roles:** `admin` only

#### Query Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | Number | `1` | Page number (min: 1) |
| `limit` | Number | `10` | Users per page (min: 1, max: 100) |
| `role` | String | — | Filter by role: `viewer`, `analyst`, or `admin` |
| `status` | String | — | Filter by status: `active` or `inactive` |
| `search` | String | — | Search in `name` and `email` fields |

#### Examples

```
GET /api/users?role=viewer&status=active
GET /api/users?search=john&page=1&limit=5
```

#### Success Response (`200`)

```json
{
  "success": true,
  "total": 4,
  "page": 1,
  "pages": 1,
  "count": 4,
  "data": [
    {
      "_id": "660a0a1b2c3d4e5f6a7b8c9d",
      "name": "Admin User",
      "email": "admin@zorvyn.com",
      "role": "admin",
      "status": "active",
      "createdAt": "2026-04-01T12:00:00.000Z",
      "updatedAt": "2026-04-03T16:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/users/:id`

Get a single user by ID.

**Authentication:** Required (Bearer Token)  
**Roles:** `admin` only

#### URL Parameters

| Parameter | Type | Description |
|---|---|---|
| `id` | String | MongoDB ObjectId of the user |

#### Success Response (`200`)

```json
{
  "success": true,
  "data": {
    "_id": "660a0a1b2c3d4e5f6a7b8c9d",
    "name": "Admin User",
    "email": "admin@zorvyn.com",
    "role": "admin",
    "status": "active",
    "lastLogin": "2026-04-03T16:00:00.000Z",
    "createdAt": "2026-04-01T12:00:00.000Z",
    "updatedAt": "2026-04-03T16:00:00.000Z"
  }
}
```

#### Error Responses

| Status | Message | Cause |
|---|---|---|
| `500` | `Invalid user ID` | Malformed ObjectId |
| `500` | `User not found` | User doesn't exist or is soft-deleted |

---

### `PUT /api/users/:id`

Update a user's role and/or status.

**Authentication:** Required (Bearer Token)  
**Roles:** `admin` only

#### URL Parameters

| Parameter | Type | Description |
|---|---|---|
| `id` | String | MongoDB ObjectId of the user to update |

#### Request Body

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `role` | String | No | `viewer`, `analyst`, or `admin` | New role |
| `status` | String | No | `active` or `inactive` | New status |

#### Business Rules

- **Self-modification blocked:** Admins cannot change their own role or status
- Both fields are optional — omitted fields are not changed

#### Request Example

```json
{
  "role": "analyst",
  "status": "active"
}
```

#### Success Response (`200`)

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "_id": "660a1b2c3d4e5f6a7b8c9d0e",
    "name": "Viewer User",
    "email": "viewer@zorvyn.com",
    "role": "analyst",
    "status": "active"
  }
}
```

#### Error Responses

| Status | Message | Cause |
|---|---|---|
| `500` | `Invalid user ID` | Malformed ObjectId |
| `500` | `User not found` | User doesn't exist |
| `500` | `You cannot modify your own role/status` | Self-modification attempt |
| `500` | `Invalid role. Must be 'viewer', 'analyst', or 'admin'` | Invalid role value |
| `500` | `Invalid status. Must be 'active' or 'inactive'` | Invalid status value |

---

### `DELETE /api/users/:id`

Soft delete a user. The user is marked as deleted and set to inactive.

**Authentication:** Required (Bearer Token)  
**Roles:** `admin` only

#### URL Parameters

| Parameter | Type | Description |
|---|---|---|
| `id` | String | MongoDB ObjectId of the user to delete |

#### Business Rules

- **Self-delete blocked:** Admins cannot delete themselves
- **Last admin protected:** The last active admin user cannot be deleted
- Soft delete sets `isDeleted: true` and `status: "inactive"`

#### Success Response (`200`)

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

#### Error Responses

| Status | Message | Cause |
|---|---|---|
| `500` | `Invalid user ID` | Malformed ObjectId |
| `500` | `User not found` | User doesn't exist or already deleted |
| `500` | `You cannot delete your own account` | Self-delete attempt |
| `500` | `Cannot delete the last active admin. Promote another user to admin first.` | Last admin protection |

---

## Data Schemas

### User Object

```json
{
  "_id": "660a0a1b2c3d4e5f6a7b8c9d",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "viewer",
  "status": "active",
  "lastLogin": "2026-04-03T16:00:00.000Z",
  "createdAt": "2026-04-01T12:00:00.000Z",
  "updatedAt": "2026-04-03T16:00:00.000Z"
}
```

> **Note:** `password` and `isDeleted` are never included in responses.

### Record Object

```json
{
  "_id": "660b2c3d4e5f6a7b8c9d0e1f",
  "user": "660a0a1b2c3d4e5f6a7b8c9d",
  "amount": 2500,
  "type": "income",
  "category": "freelance",
  "date": "2026-04-10T00:00:00.000Z",
  "note": "Web design contract",
  "createdAt": "2026-04-03T16:00:00.000Z",
  "updatedAt": "2026-04-03T16:00:00.000Z"
}
```

> **Note:** `isDeleted` is never included in responses.

---

## Authentication Flow

```
1. User registers:  POST /api/auth/register  →  receives JWT token
2. User logs in:    POST /api/auth/login     →  receives JWT token
3. User includes token in all subsequent requests:
   Authorization: Bearer <token>
4. Protected routes verify the token and check:
   - Token validity and expiry
   - User exists in database
   - User is not soft-deleted
   - User account is active
   - User role matches required role(s)
```

---

## Soft Delete Behavior

When a resource is "deleted":

1. The `isDeleted` field is set to `true`
2. For users, `status` is also set to `"inactive"`
3. The resource no longer appears in list queries
4. The resource cannot be fetched by ID
5. The data remains in the database for audit/recovery purposes
6. A soft-deleted user cannot log in (filtered out during login lookup)
