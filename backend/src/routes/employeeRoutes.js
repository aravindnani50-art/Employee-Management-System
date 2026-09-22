// Employee Routes
// Maps HTTP endpoints to employee controller methods and applies route-specific validation middleware.

const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { validateEmployee, validateIdParam } = require('../middleware/validateRequest');

// GET /api/employees - Get all employees with pagination, search, filters, and sorting
router.get('/', employeeController.getEmployees);

// GET /api/employees/:id - Get a single employee by ID
router.get('/:id', validateIdParam, employeeController.getEmployeeById);

// POST /api/employees - Create a new employee
router.post('/', validateEmployee(false), employeeController.createEmployee);

// PUT /api/employees/:id - Update an employee by ID
router.put('/:id', validateIdParam, validateEmployee(true), employeeController.updateEmployee);

// DELETE /api/employees/:id - Delete an employee by ID
router.delete('/:id', validateIdParam, employeeController.deleteEmployee);

module.exports = router;
