# 🏢 Employee Management System - Backend API

A clean, beginner-friendly, and production-structured RESTful backend API built with **Node.js**, **Express.js**, **Prisma ORM**, and **PostgreSQL**.

This backend is designed as part of a full-stack Employee Management System, built to seamlessly integrate with a **React** frontend using native `fetch()` calls.

---

## 📑 Table of Contents

1. [Project Overview & Architecture](#-project-overview--architecture)
2. [Folder Structure](#-folder-structure)
3. [Technology Stack](#-technology-stack)
4. [Prerequisites](#-prerequisites)
5. [Installation & Setup](#-installation--setup)
6. [Prisma Concepts Explained](#-prisma-concepts-explained)
7. [Database Seeding](#-database-seeding)
8. [Running the Application](#-running-the-application)
9. [Database-Level vs Frontend Operations](#-database-level-vs-frontend-operations)
10. [REST API Documentation](#-rest-api-documentation)
    - [Health Check](#health-check)
    - [Department Endpoints](#department-endpoints)
    - [Employee Endpoints](#employee-endpoints)
11. [Testing Guide (Postman / Thunder Client / cURL)](#-testing-guide-postman--thunder-client--curl)
12. [HTTP Status Codes Reference](#-http-status-codes-reference)
13. [Security & Environment Variables](#-security--environment-variables)

---

## 🎯 Project Overview & Architecture

### Request-Response Flow

The application follows a strictly layered, beginner-friendly architecture where responsibilities are cleanly decoupled:

```
[ React Frontend (fetch) ]
           │
           ▼
[ Express Router (routes/) ]
  └── Defines endpoints & associates middleware
           │
           ▼
[ Validation Middleware (validators/ & middleware/) ]
  └── Validates request body, params, data types
           │
           ▼
[ Controller Layer (controllers/) ]
  └── Extracts req.body, req.params, req.query, sends status & JSON response
           │
           ▼
[ Service Layer (services/) ]
  └── Encapsulates business logic, duplicate checks, sorting whitelist
           │
           ▼
[ Prisma ORM (config/database.js & schema.prisma) ]
  └── Translates JavaScript objects into optimized SQL queries
           │
           ▼
[ PostgreSQL Database (employee_management) ]
  └── Executes relational queries, constraints, and transactions
```

### Flow Tracing Example (Creating an Employee via POST)

1. **Client** makes a `POST /api/employees` request with a JSON body.
2. **App Entry (`src/app.js`)** applies CORS and `express.json()` body parsing.
3. **Route (`src/routes/employeeRoutes.js`)** forwards the request to `validateEmployee` middleware.
4. **Validator (`src/validators/employeeValidator.js`)** checks that `name`, `email`, `departmentId`, `designation`, and `salary` are valid. If invalid, responds immediately with **HTTP 400 Bad Request**.
5. **Controller (`src/controllers/employeeController.js`)** receives the valid payload and calls `employeeService.createEmployee(req.body)`.
6. **Service (`src/services/employeeService.js`)** checks:
   - Does this email already exist? (If yes, throws **409 Conflict**).
   - Does the referenced department exist? (If no, throws **400 Bad Request**).
7. **Prisma ORM (`src/config/database.js`)** executes the `INSERT` query in PostgreSQL.
8. **PostgreSQL** stores the record and enforces foreign key constraints.
9. **Controller** returns **HTTP 201 Created** with the newly created employee including their department details.
10. If an unhandled error occurs at any point, the **Centralized Error Handler (`src/middleware/errorHandler.js`)** catches it and returns a safe, consistent JSON error.

---

## 📁 Folder Structure

```
backend/
│
├── prisma/
│   ├── migrations/               # Auto-generated SQL migration history
│   ├── schema.prisma             # Data models & database configuration
│   └── seed.js                   # Database seed script for dummy data
│
├── src/
│   ├── config/
│   │   └── database.js           # PrismaClient singleton configuration
│   │
│   ├── controllers/
│   │   ├── departmentController.js # Handles department HTTP requests/responses
│   │   └── employeeController.js   # Handles employee HTTP requests/responses
│   │
│   ├── middleware/
│   │   ├── errorHandler.js       # Centralized error handler & AppError class
│   │   ├── notFound.js           # 404 Route Not Found middleware
│   │   └── validateRequest.js    # Express middleware adapter for validators
│   │
│   ├── routes/
│   │   ├── departmentRoutes.js   # Department route definitions
│   │   └── employeeRoutes.js     # Employee route definitions
│   │
│   ├── services/
│   │   ├── departmentService.js  # Department database queries
│   │   └── employeeService.js    # Employee business logic, pagination & filtering
│   │
│   ├── validators/
│   │   └── employeeValidator.js  # Input validation helper functions
│   │
│   └── app.js                    # Express app initialization, CORS & server start
│
├── .env                          # Local environment variables (DO NOT COMMIT)
├── .env.example                  # Template environment variables for setup
├── .gitignore                    # Git ignore file (ignores .env and node_modules)
├── package.json                  # Project dependencies and npm scripts
└── README.md                     # Comprehensive project documentation
```

---

## 🛠 Technology Stack

- **Runtime:** [Node.js](https://nodejs.org/) (v18+)
- **Web Framework:** [Express.js](https://expressjs.com/) (v4)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Prisma ORM](https://www.prisma.io/)
- **Cross-Origin Resource Sharing:** [cors](https://www.npmjs.com/package/cors)
- **Configuration Management:** [dotenv](https://www.npmjs.com/package/dotenv)

---

## 📦 Prerequisites

Before starting, ensure you have the following installed on your machine:
- **Node.js** (v18 or higher)
- **npm** (comes bundled with Node.js)
- **PostgreSQL** service installed and running locally

---

## 🚀 Installation & Setup

### Step 1: Navigate to backend folder
```bash
cd backend
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and verify your PostgreSQL credentials:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/employee_management?schema=public"
FRONTEND_URL="http://localhost:3000"
```

---

## 🔍 Prisma Concepts Explained

Prisma simplifies database interactions through three core concepts:

### 1. Prisma Schema (`prisma/schema.prisma`)
The **single source of truth** for your database architecture. It defines:
- The database connection (`provider = "postgresql"`).
- Models and their fields (`Employee`, `Department`).
- Relationships (One-to-Many: `Department` has many `Employee`s).

### 2. Prisma Migrations (`prisma migrate`)
Whenever you update your schema models, Prisma creates a timestamped SQL migration file (stored in `prisma/migrations/`). Running migrations ensures that your database schema stays in sync across your team and deployment environments without writing manual SQL DDL scripts.

```bash
npx prisma migrate dev --name init
```

### 3. Prisma Client (`@prisma/client`)
An auto-generated, type-safe database client configured in `src/config/database.js`. It provides intuitive JavaScript methods like:
- `prisma.employee.findMany()`
- `prisma.employee.create()`
- `prisma.employee.update()`
- `prisma.employee.delete()`

---

## 🌱 Database Seeding

To quickly populate the database with realistic sample departments and 15+ employees:

```bash
npm run prisma:seed
```

This will automatically create:
- 5 Departments: `Engineering`, `Human Resources`, `Finance`, `Marketing`, `Operations`.
- 16 Realistic Employees with varying designations and salaries for testing search, pagination, and filtering.

---

## 🏃 Running the Application

### Development Mode (with hot-reloading via nodemon):
```bash
npm run dev
```

### Production / Standard Mode:
```bash
npm start
```

The server will start at:
```
http://localhost:5000
```

---

## 💡 Database-Level vs Frontend Operations

In modern production systems, operations should be performed at the **Database Level** rather than in JavaScript memory or on the frontend. Here is why:

| Feature | Frontend / In-Memory JavaScript | Database-Level (PostgreSQL via Prisma) |
| :--- | :--- | :--- |
| **Pagination** | Fetch all 100,000 records across the network; slice `[0..10]`. High latency, massive memory waste. | Prisma uses `skip` and `take`. The database only returns the requested 10 rows. Ultra-fast. |
| **Search** | Loop through loaded array with `array.filter()`. Fails for un-fetched pages. | Prisma uses `WHERE name ILIKE '%term%' OR email ILIKE '%term%'`. Indexed and lightning fast. |
| **Filtering** | Filters only data already in client state. | Database filters rows directly via `WHERE departmentId = 2`. |
| **Sorting** | Client-side `array.sort()`. Sorts only the current page, producing inaccurate global order. | Database uses `ORDER BY salary DESC` globally before paginating. |

---

## 📚 REST API Documentation

### Base URL:
`http://localhost:5000/api`

---

### Health Check

#### `GET /api/health`
Checks if the server is running.
- **Status Code:** `200 OK`
- **Response:**
```json
{
  "success": true,
  "message": "Employee Management Backend API is running smoothly",
  "timestamp": "2026-09-18T06:40:00.000Z"
}
```

---

### Department Endpoints

#### `GET /api/departments`
Retrieves all departments for dropdowns and filtering in the React frontend.
- **Status Code:** `200 OK`
- **Response:**
```json
{
  "success": true,
  "message": "Departments fetched successfully",
  "data": [
    { "id": 1, "name": "Engineering", "createdAt": "2026-09-18T06:38:41.000Z" },
    { "id": 3, "name": "Finance", "createdAt": "2026-09-18T06:38:41.000Z" },
    { "id": 2, "name": "Human Resources", "createdAt": "2026-09-18T06:38:41.000Z" },
    { "id": 4, "name": "Marketing", "createdAt": "2026-09-18T06:38:41.000Z" },
    { "id": 5, "name": "Operations", "createdAt": "2026-09-18T06:38:41.000Z" }
  ]
}
```

---

### Employee Endpoints

#### 1. `GET /api/employees`
Retrieves employees with support for pagination, search, filters, and sorting.

**Query Parameters:**
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | Integer | `1` | Current page number |
| `limit` | Integer | `10` | Number of records per page (max 100) |
| `search` | String | - | Case-insensitive search on employee name or email |
| `department` | Integer | - | Filter by Department ID |
| `designation` | String | - | Filter by designation (case-insensitive) |
| `sortBy` | String | `createdAt` | Field to sort by: `name`, `salary`, `createdAt`, `id` |
| `sortOrder` | String | `desc` | Sort direction: `asc` or `desc` |

**Example Request:**
```
GET /api/employees?page=1&limit=2&search=rahul&department=1&sortBy=salary&sortOrder=desc
```

**Status Code:** `200 OK`
**Response:**
```json
{
  "success": true,
  "message": "Employees fetched successfully",
  "data": [
    {
      "id": 3,
      "name": "Rahul Kumar",
      "email": "rahul.kumar@example.com",
      "phone": "9876543212",
      "departmentId": 1,
      "designation": "Backend Developer",
      "salary": 80000,
      "createdAt": "2026-09-18T06:38:41.000Z",
      "department": {
        "id": 1,
        "name": "Engineering",
        "createdAt": "2026-09-18T06:38:41.000Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 2,
    "total": 1,
    "totalPages": 1
  }
}
```

---

#### 2. `GET /api/employees/:id`
Retrieves a single employee by their ID with department details.

**Status Code:** `200 OK`
**Response:**
```json
{
  "success": true,
  "message": "Employee fetched successfully",
  "data": {
    "id": 1,
    "name": "Aarav Sharma",
    "email": "aarav.sharma@example.com",
    "phone": "9876543210",
    "departmentId": 1,
    "designation": "Senior Full-Stack Developer",
    "salary": 95000,
    "createdAt": "2026-09-18T06:38:41.000Z",
    "department": {
      "id": 1,
      "name": "Engineering",
      "createdAt": "2026-09-18T06:38:41.000Z"
    }
  }
}
```

**Error Responses:**
- If employee does not exist: `404 Not Found`
  ```json
  { "success": false, "message": "Employee not found" }
  ```
- If ID is not a positive integer: `400 Bad Request`
  ```json
  { "success": false, "message": "Invalid employee ID. ID must be a positive integer." }
  ```

---

#### 3. `POST /api/employees`
Creates a new employee record.

**Request Body:**
```json
{
  "name": "Rohit Verma",
  "email": "rohit.verma@example.com",
  "phone": "9812345678",
  "departmentId": 1,
  "designation": "DevOps Specialist",
  "salary": 85000
}
```

**Status Code:** `201 Created`
**Response:**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "id": 17,
    "name": "Rohit Verma",
    "email": "rohit.verma@example.com",
    "phone": "9812345678",
    "departmentId": 1,
    "designation": "DevOps Specialist",
    "salary": 85000,
    "createdAt": "2026-09-18T06:45:00.000Z",
    "department": {
      "id": 1,
      "name": "Engineering",
      "createdAt": "2026-09-18T06:38:41.000Z"
    }
  }
}
```

**Error Responses:**
- If email is already registered: `409 Conflict`
  ```json
  { "success": false, "message": "Employee with this email already exists" }
  ```
- If department does not exist: `400 Bad Request`
  ```json
  { "success": false, "message": "Department with the specified ID does not exist" }
  ```
- If validation fails: `400 Bad Request`
  ```json
  { "success": false, "message": "Salary must be a valid positive number" }
  ```

---

#### 4. `PUT /api/employees/:id`
Updates an existing employee.

**Request Body:**
```json
{
  "name": "Rohit Verma",
  "email": "rohit.verma@example.com",
  "phone": "9812345678",
  "departmentId": 1,
  "designation": "Lead DevOps Architect",
  "salary": 105000
}
```

**Status Code:** `200 OK`
**Response:**
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    "id": 17,
    "name": "Rohit Verma",
    "email": "rohit.verma@example.com",
    "phone": "9812345678",
    "departmentId": 1,
    "designation": "Lead DevOps Architect",
    "salary": 105000,
    "createdAt": "2026-09-18T06:45:00.000Z",
    "department": {
      "id": 1,
      "name": "Engineering"
    }
  }
}
```

---

#### 5. `DELETE /api/employees/:id`
Deletes an employee record by ID.

**Status Code:** `200 OK`
**Response:**
```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

**Error Responses:**
- If employee does not exist: `404 Not Found`
  ```json
  { "success": false, "message": "Employee not found" }
  ```

---

## 🧪 Testing Guide (Postman / Thunder Client / cURL)

You can test every endpoint using Postman, VS Code's Thunder Client extension, or cURL from your terminal:

### 1. Create Employee (POST)
```bash
curl -X POST http://localhost:5000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Siddharth Sen",
    "email": "siddharth@example.com",
    "phone": "9876500001",
    "departmentId": 1,
    "designation": "System Architect",
    "salary": 120000
  }'
```

### 2. Get All Employees (GET)
```bash
curl http://localhost:5000/api/employees
```

### 3. Pagination (GET)
```bash
curl "http://localhost:5000/api/employees?page=1&limit=5"
```

### 4. Search by Name or Email (GET)
```bash
curl "http://localhost:5000/api/employees?search=rahul"
```

### 5. Filter by Department (GET)
```bash
curl "http://localhost:5000/api/employees?department=1"
```

### 6. Filter by Designation (GET)
```bash
curl "http://localhost:5000/api/employees?designation=Developer"
```

### 7. Sort by Salary Ascending (GET)
```bash
curl "http://localhost:5000/api/employees?sortBy=salary&sortOrder=asc"
```

### 8. Get Employee by ID (GET)
```bash
curl http://localhost:5000/api/employees/1
```

### 9. Update Employee (PUT)
```bash
curl -X PUT http://localhost:5000/api/employees/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aarav Sharma",
    "email": "aarav.sharma@example.com",
    "phone": "9876543210",
    "departmentId": 1,
    "designation": "Principal Software Engineer",
    "salary": 130000
  }'
```

### 10. Delete Employee (DELETE)
```bash
curl -X DELETE http://localhost:5000/api/employees/1
```

### 11. Get All Departments (GET)
```bash
curl http://localhost:5000/api/departments
```

---

## 🚦 HTTP Status Codes Reference

The API uses semantic standard HTTP status codes:

- `200 OK`: Successful retrieval, update, or deletion.
- `201 Created`: Successful creation of a new employee.
- `400 Bad Request`: Validation failure, missing required fields, or invalid numeric ID.
- `404 Not Found`: Requested route or employee record does not exist.
- `409 Conflict`: Duplicate unique key (e.g. employee email already registered).
- `500 Internal Server Error`: Unexpected server issue (sanitized, internal details shielded).

---

## 🔒 Security & Environment Variables

1. **`.env` is Git-Ignored:** The actual `.env` containing database passwords is added to `.gitignore` to prevent credential leakage.
2. **`.env.example` Provided:** A placeholder file is maintained so developers know which environment variables are expected.
3. **CORS Protected:** Configured to allow requests from the React frontend port (`FRONTEND_URL`), preventing arbitrary cross-site access in production.
4. **Input Sanitization & Whitelisting:** Sort columns are strictly validated against `['name', 'salary', 'createdAt', 'id']` to prevent unexpected queries.
