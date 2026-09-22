# Employee Management System (EMS) - Frontend

A clean, beginner-friendly, and maintainable **React Frontend** for a full-stack Employee Management System. Built using standard functional components, modern React hooks (`useState`, `useEffect`), pure CSS, and the native browser `fetch()` API.

This frontend interfaces directly with a Node.js + Express + Prisma + PostgreSQL backend via standard REST APIs.

---

## 🎯 Project Overview & Architecture

This application is strictly the **frontend client** of the EMS. It contains **no mock data or mock backends**, communicates using JSON payloads over HTTP, and leaves all persistence to the backend.

```
React Frontend (Vite)
       │
       ▼
src/services/employeeApi.js (Native fetch)
       │
       ▼
REST API (JSON over HTTP)
       │
       ▼
Node.js + Express Backend
       │
       ▼
Prisma ORM
       │
       ▼
PostgreSQL Database
```

---

## 🛠️ Technology Stack

- **React 18**: Functional components with hooks (`useState`, `useEffect`, `useCallback`)
- **Vite**: Ultra-fast build tool and dev server
- **JavaScript (ES6+)**: Clean, readable syntax without over-engineering
- **CSS3**: Pure CSS using CSS variables, flexbox, and CSS grid (no heavy CSS libraries)
- **Fetch API**: Native browser `fetch()` for all HTTP requests (Axios is strictly excluded)

---

## 📁 Folder Structure

```
frontend/
│
├── src/
│   ├── components/
│   │   ├── ConfirmModal.jsx    # Delete confirmation modal dialog
│   │   ├── EmployeeCard.jsx    # Responsive card representation for mobile screens
│   │   ├── EmployeeForm.jsx    # Reusable Add & Edit form with client-side validation
│   │   ├── EmployeeList.jsx    # Tabular desktop view & mobile card grid
│   │   ├── EmptyState.jsx      # Zero-records view with action prompt
│   │   ├── ErrorMessage.jsx    # Error banner with "Retry" button
│   │   ├── FilterBar.jsx       # Department, Designation, and Sort controls
│   │   ├── Loading.jsx         # Loading spinner and status indicator
│   │   ├── Pagination.jsx      # Page navigation (Prev, Next, Page limits)
│   │   └── SearchBar.jsx       # Server-side search input (name, email)
│   │
│   ├── pages/
│   │   └── EmployeesPage.jsx   # Master page coordinating state and API calls
│   │
│   ├── services/
│   │   └── employeeApi.js      # Centralized REST API service using native fetch()
│   │
│   ├── App.jsx                 # Top-level shell with navigation and header
│   ├── main.jsx                # React DOM root mounting
│   └── index.css               # Clean, professional styling
│
├── .env                        # Environment variables (VITE_API_BASE_URL)
├── .env.example                # Example environment variable template
├── index.html                  # HTML5 entry shell
├── package.json                # Project scripts and dependencies
├── vite.config.js              # Vite React configuration
└── README.md                   # Comprehensive documentation
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have **Node.js** (v18 or higher) and **npm** installed:
```bash
node -v
npm -v
```

### 1. Navigate to the Frontend Folder
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
By default, the `.env` file points to the backend running at `http://localhost:5000/api`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```
If your backend runs on a different port or host, update `VITE_API_BASE_URL` in `.env`.

### 4. Run the Development Server
```bash
npm run dev
```
Vite will launch the local development server at:
👉 **`http://localhost:3000`**

### 5. Build for Production
To create an optimized production build:
```bash
npm run build
```

---

## 📡 API Contract & Endpoints

All network requests are centralized in `src/services/employeeApi.js` and communicate with the following backend endpoints:

| Method | Endpoint | Description | Query Parameters / Payload |
|---|---|---|---|
| `GET` | `/api/employees` | Get paginated list of employees | `?page=1&limit=10&search=rahul&department=1&designation=Developer&sortBy=name&sortOrder=asc` |
| `GET` | `/api/employees/:id` | Get single employee details | URL parameter `id` |
| `POST` | `/api/employees` | Create a new employee | JSON body `{ name, email, phone, departmentId, department, designation, salary }` |
| `PUT` | `/api/employees/:id` | Update an existing employee | JSON body `{ name, email, phone, departmentId, department, designation, salary }` |
| `DELETE` | `/api/employees/:id` | Delete an employee | URL parameter `id` |
| `GET` | `/api/departments` | Get list of departments | Populates form and filter dropdowns |

### Expected API Response Format
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "phone": "+1 555-0199",
      "department": { "id": 2, "name": "Engineering" },
      "departmentId": 2,
      "designation": "Software Engineer",
      "salary": 85000,
      "createdAt": "2026-01-15T08:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

## ⚡ Key Features & Checklist Coverage

1. **Project Architecture**: Clear separation of UI components, pages, and API service layer.
2. **React Frontend**: Built using functional components and standard hooks (`useState`, `useEffect`, `useCallback`).
3. **API Service Layer (`employeeApi.js`)**: All `fetch()` calls isolated from components.
4. **Native `fetch()`**: Strictly uses `fetch()`, zero Axios usage.
5. **Employee List**: Clean table view for desktop and responsive cards for mobile.
6. **Dynamic Rendering**: Uses `.map()` to render employee records from the backend.
7. **Add Employee**: Reusable modal form with real-time feedback.
8. **Edit Employee**: Pre-populates existing employee data and sends `PUT` request.
9. **Delete Employee**: Safe deletion with confirmation modal ("Are you sure you want to delete...?").
10. **Search**: Server-side search by name or email with instant clear button.
11. **Filtering**: Filter by Department (loaded from `/api/departments`) and Designation.
12. **Sorting**: Sort by Name, Salary, and Date Created in Ascending or Descending order.
13. **Pagination**: Previous/Next navigation, page counts, page size selector, and boundary disable checks.
14. **Departments Integration**: Loads departments from `/api/departments` for filters and forms.
15. **Loading State**: Displays "Loading employees..." spinner during data retrieval.
16. **Success State**: Displays records clearly with styled badges and formatted salary currency.
17. **Error State**: User-friendly error message when an API request fails.
18. **No-Data State**: Displays "No employees found" empty state with action button.
19. **Network Failure Handling**: Handles backend server offline / connection refused gracefully.
20. **Retry Functionality**: Dedicated "Retry" button to re-trigger failed requests without page reload.
21. **Client-Side Validation**:
    - Name (required, min 2 chars)
    - Email (required, valid format regex)
    - Department (required dropdown selection)
    - Designation (required)
    - Salary (required, positive number > 0)
    - Phone (valid phone pattern if entered)
22. **Backend Error Handling**: Form displays 409 Conflict ("Email already exists") or 400 Bad Request error messages directly to the user.
23. **HTTP Status Handling**: Handles 200, 201, 400, 404, 409, 500, and network disconnects.
24. **Responsive UI**: Responsive design with desktop table and mobile-friendly card layouts.
