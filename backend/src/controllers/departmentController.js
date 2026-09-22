// Department Controller
// Handles HTTP requests and responses for Department resources.

const departmentService = require('../services/departmentService');

/**
 * Controller to fetch all departments
 * Route: GET /api/departments
 */
const getDepartments = async (req, res, next) => {
  try {
    const departments = await departmentService.getAllDepartments();

    res.status(200).json({
      success: true,
      message: 'Departments fetched successfully',
      data: departments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
};
