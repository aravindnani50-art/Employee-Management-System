// Validation Middleware
// Validates request payloads and route parameters before reaching the controller.
// Keeps controller code clean and focused on business flow.

const { validateEmployeeData, parseAndValidateId } = require('../validators/employeeValidator');

/**
 * Middleware to validate employee request body for creation or update
 * @param {boolean} isUpdate - Whether this is an update (PUT) request
 */
const validateEmployee = (isUpdate = false) => {
  return (req, res, next) => {
    const errors = validateEmployeeData(req.body, isUpdate);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0], // Return the first error as the primary message
        errors,            // Include full list of validation issues
      });
    }

    next();
  };
};

/**
 * Middleware to validate numeric ID parameter in the URL route (e.g. /:id)
 */
const validateIdParam = (req, res, next) => {
  const parsedId = parseAndValidateId(req.params.id);

  if (parsedId === null) {
    return res.status(400).json({
      success: false,
      message: 'Invalid employee ID. ID must be a positive integer.',
    });
  }

  // Store the parsed integer ID on req for easy access in controller/service
  req.parsedId = parsedId;
  next();
};

module.exports = {
  validateEmployee,
  validateIdParam,
};
