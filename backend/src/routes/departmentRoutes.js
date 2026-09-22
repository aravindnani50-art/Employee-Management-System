// Department Routes
// Maps HTTP endpoints to department controller methods.

const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

// GET /api/departments - Fetch list of all departments
router.get('/', departmentController.getDepartments);

module.exports = router;
