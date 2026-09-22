// Employee Controller
// Coordinates HTTP request handling, parameter extraction, service invocation, and JSON response delivery.

const employeeService = require('../services/employeeService');

/**
 * Controller to create a new employee
 * Route: POST /api/employees
 */
const createEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployee(req.body);

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to get all employees with pagination, search, filter, and sort
 * Route: GET /api/employees
 */
const getEmployees = async (req, res, next) => {
  try {
    const { employees, pagination } = await employeeService.getAllEmployees(req.query);

    res.status(200).json({
      success: true,
      message: 'Employees fetched successfully',
      data: employees,
      pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to get a single employee by ID
 * Route: GET /api/employees/:id
 */
const getEmployeeById = async (req, res, next) => {
  try {
    // req.parsedId is validated and attached by validateIdParam middleware
    const employeeId = req.parsedId;
    const employee = await employeeService.getEmployeeById(employeeId);

    res.status(200).json({
      success: true,
      message: 'Employee fetched successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to update an existing employee
 * Route: PUT /api/employees/:id
 */
const updateEmployee = async (req, res, next) => {
  try {
    const employeeId = req.parsedId;
    const updatedEmployee = await employeeService.updateEmployee(employeeId, req.body);

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to delete an employee
 * Route: DELETE /api/employees/:id
 */
const deleteEmployee = async (req, res, next) => {
  try {
    const employeeId = req.parsedId;
    await employeeService.deleteEmployee(employeeId);

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
