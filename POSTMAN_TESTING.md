# Postman Testing Guide

This guide walks you through testing the Finance Dashboard Backend APIs using Postman. Be sure your server is running (`npm run dev`) and you have seeded the database (`npm run seed`) before starting.

The server runs on `http://localhost:5000` by default.

## 1. Authentication
All endpoints (except login/register) require a Bearer Token.

### A. Login as Admin
Use this to get an Admin token to test creation/deletion APIs.
* **Method:** `POST`
* **URL:** `http://localhost:5000/api/auth/login`
* **Body (JSON):**
```json
{
  "email": "admin@zorvyn.com",
  "password": "admin123"
}
```
* **Action:** Copy the `token` from the response. Go to the "Authorization" tab for all following requests, select "Bearer Token", and paste the token.

### B. Register a New User
* **Method:** `POST`
* **URL:** `http://localhost:5000/api/auth/register`
* **Body (JSON):**
```json
{
  "name": "Test User",
  "email": "testuser@zorvyn.com",
  "password": "password123",
  "role": "viewer"
}
```

### C. Get Current User Profile
* **Method:** `GET`
* **URL:** `http://localhost:5000/api/auth/me`
* **Auth:** Bearer Token (using Admin or Test User token)

---

## 2. Records Management

### A. List All Records (Admin/Analyst/Viewer)
* **Method:** `GET`
* **URL:** `http://localhost:5000/api/records`
* **Auth:** Bearer Token
* **Query Params (Optional):**
  * `type=income`
  * `category=salary`
  * `page=1`
  * `limit=5`

### B. Create a Record (Admin Only)
* **Method:** `POST`
* **URL:** `http://localhost:5000/api/records`
* **Auth:** Bearer Token (Admin)
* **Body (JSON):**
```json
{
  "amount": 2500,
  "type": "income",
  "category": "freelance",
  "date": "2026-04-10T00:00:00Z",
  "note": "Web design contract payment"
}
```
* **Action:** Copy the `_id` field from the response data to use in update/delete.

### C. Update a Record (Admin Only)
* **Method:** `PUT`
* **URL:** `http://localhost:5000/api/records/<REPLACE_WITH_RECORD_ID>`
* **Auth:** Bearer Token (Admin)
* **Body (JSON):**
```json
{
  "amount": 3000,
  "note": "Updated web design contract payment"
}
```

### D. Delete a Record (Admin Only)
* **Method:** `DELETE`
* **URL:** `http://localhost:5000/api/records/<REPLACE_WITH_RECORD_ID>`
* **Auth:** Bearer Token (Admin)

### E. Test Role Restriction (Viewer creating a record)
* **Method:** `POST`
* **URL:** `http://localhost:5000/api/records`
* **Auth:** Bearer Token (Get token via Login as viewer@zorvyn.com / viewer123)
* **Body (JSON):** Same as 2B.
* **Expected Result:** `403 Forbidden` ("Access denied. Role 'viewer' is not permitted.")

---

## 3. Dashboard Summaries

### A. Get Dashboard Analytics (Admin/Analyst)
* **Method:** `GET`
* **URL:** `http://localhost:5000/api/dashboard`
* **Auth:** Bearer Token (Admin or Analyst)
* **Expected Result:** JSON object containing `totals`, `categoryBreakdown`, `monthlyTrends`, and `recentTransactions`.

---

## 4. User Management

### A. List All Users (Admin Only)
* **Method:** `GET`
* **URL:** `http://localhost:5000/api/users`
* **Auth:** Bearer Token (Admin)
* **Query Params (Optional):**
  * `role=viewer`
  * `status=active`

### B. Update User Role (Admin Only)
* **Method:** `PUT`
* **URL:** `http://localhost:5000/api/users/<REPLACE_WITH_USER_ID>`
* **Auth:** Bearer Token (Admin)
* **Body (JSON):**
```json
{
  "role": "analyst",
  "status": "active"
}
```

### C. Soft Delete a User (Admin Only)
* **Method:** `DELETE`
* **URL:** `http://localhost:5000/api/users/<REPLACE_WITH_USER_ID>`
* **Auth:** Bearer Token (Admin)
