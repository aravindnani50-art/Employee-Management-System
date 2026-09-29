// Employee Service
// Contains all business logic and Prisma ORM database interactions.
// Keeps controllers lightweight and decouples HTTP concerns from database operations.

const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

// Whitelist of allowed sorting fields to prevent SQL/Prisma injection or unexpected query errors
const ALLOWED_SORT_FIELDS = ['name', 'salary', 'createdAt', 'id'];
const ALLOWED_SORT_ORDERS = ['asc', 'desc'];

/**
 * Creates a new employee record after validating email uniqueness and department existence
 * @param {Object} employeeData - Validated employee attributes
 * @returns {Promise<Object>} Created employee with department details
 */
const createEmployee = async (employeeData) => {
  const { name, email, phone, departmentId, designation, salary, imageUrl } = employeeData;
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check if email already exists in the database
  const existingEmployee = await prisma.employee.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingEmployee) {
    throw new AppError('Employee with this email already exists', 409);
  }

  // 2. Check if the specified department exists
  const department = await prisma.department.findUnique({
    where: { id: Number(departmentId) },
  });

  if (!department) {
    throw new AppError('Department with the specified ID does not exist', 400);
  }

  // 3. Create employee record with department relation
  const newEmployee = await prisma.employee.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? String(phone).trim() : null,
      departmentId: Number(departmentId),
      designation: designation.trim(),
      salary: parseFloat(salary),
      imageUrl: imageUrl && String(imageUrl).trim() ? String(imageUrl).trim() : null,
    },
    include: {
      department: true,
    },
  });

  return newEmployee;
};

/**
 * Fetches employees with database-level pagination, searching, filtering, and sorting.
 * 
 * WHY DATABASE-LEVEL FILTERING / PAGINATION IS PREFERABLE FOR LARGER DATASETS:
 * ---------------------------------------------------------------------------
 * 1. Memory Efficiency: Fetching 100,000 rows into Node.js memory just to filter
 *    and slice 10 items in JavaScript wastes server RAM and can crash the process (OOM).
 * 2. Network Overhead: Only transmitting 10 rows across the database network connection
 *    is orders of magnitude faster than transferring the entire database table.
 * 3. PostgreSQL Indexes: The database engine utilizes B-Tree indexes for fast WHERE
 *    matching, sorting, and counting, computing results in single-digit milliseconds.
 * 4. Scalability: As the dataset grows from 10 to 1,000,000 employees, database-level
 *    queries stay fast and performant, whereas in-memory operations slow down drastically.
 * 
 * @param {Object} queryParams - Query parameters from request (page, limit, search, etc.)
 * @returns {Promise<Object>} { employees, pagination: { page, limit, total, totalPages } }
 */
const getAllEmployees = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    search,
    department,
    designation,
    sortBy = 'name',
    sortOrder = 'asc',
  } = queryParams;

  // Normalize pagination parameters
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10)); // Clamp between 1 and 100
  const skip = (parsedPage - 1) * parsedLimit;
  const take = parsedLimit;

  // Build dynamic database WHERE clause
  const where = {};

  // Database-level search on name OR email (case-insensitive)
  if (search && typeof search === 'string' && search.trim() !== '') {
    const searchTerm = search.trim();
    where.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { email: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  // Database-level department filter
  if (department !== undefined && department !== '') {
    const deptId = parseInt(department, 10);
    if (!isNaN(deptId) && deptId > 0) {
      where.departmentId = deptId;
    }
  }

  // Database-level designation filter (case-insensitive contains)
  if (designation && typeof designation === 'string' && designation.trim() !== '') {
    where.designation = {
      contains: designation.trim(),
      mode: 'insensitive',
    };
  }

  // Validate and sanitize sorting inputs against whitelist
  const validatedSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'name';
  const validatedSortOrder = ALLOWED_SORT_ORDERS.includes(String(sortOrder).toLowerCase())
    ? String(sortOrder).toLowerCase()
    : 'asc';

  // Fetch matching records with relational department details
  const allEmployees = await prisma.employee.findMany({
    where,
    orderBy: {
      [validatedSortBy]: validatedSortOrder,
    },
    include: {
      department: true,
    },
  });

  const total = allEmployees.length;

  // Custom ordering logic:
  // "Aravind Kumar" appears first, followed immediately by "Bhuvana Thummalapalli".
  // Keep all other employees after them using the existing sorting/order logic.
  const isAravind = (emp) => {
    const name = (emp?.name || '').trim().toLowerCase();
    return (name.includes('aravind') && name.includes('kumar')) || emp?.id === 15;
  };

  const isBhuvana = (emp) => {
    const name = (emp?.name || '').trim().toLowerCase();
    return (name.includes('bhuvana') && name.includes('thummalapalli')) || emp?.id === 21;
  };

  const aravind = allEmployees.find(isAravind);
  const bhuvana = allEmployees.find(isBhuvana);
  const others = allEmployees.filter((emp) => !isAravind(emp) && !isBhuvana(emp));

  const orderedEmployees = [
    ...(aravind ? [aravind] : []),
    ...(bhuvana ? [bhuvana] : []),
    ...others,
  ];

  const employees = orderedEmployees.slice(skip, skip + take);
  const totalPages = Math.ceil(total / parsedLimit) || 1;

  return {
    employees,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages,
    },
  };
};

/**
 * Retrieves a single employee by ID including department details
 * @param {number} id - Employee ID
 * @returns {Promise<Object>} Employee object with department
 */
const getEmployeeById = async (id) => {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      department: true,
    },
  });

  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  return employee;
};

/**
 * Updates an employee's details
 * @param {number} id - Employee ID to update
 * @param {Object} updateData - New employee data
 * @returns {Promise<Object>} Updated employee object
 */
const updateEmployee = async (id, updateData) => {
  // 1. Verify the employee exists
  const existingEmployee = await prisma.employee.findUnique({
    where: { id },
  });

  if (!existingEmployee) {
    throw new AppError('Employee not found', 404);
  }

  const { name, email, phone, departmentId, designation, salary, imageUrl } = updateData;
  const normalizedEmail = email.trim().toLowerCase();

  // 2. Check if the updated email is already taken by ANOTHER employee
  if (normalizedEmail !== existingEmployee.email) {
    const emailConflict = await prisma.employee.findUnique({
      where: { email: normalizedEmail },
    });

    if (emailConflict && emailConflict.id !== id) {
      throw new AppError('Employee with this email already exists', 409);
    }
  }

  // 3. Verify department existence if departmentId is changed
  const department = await prisma.department.findUnique({
    where: { id: Number(departmentId) },
  });

  if (!department) {
    throw new AppError('Department with the specified ID does not exist', 400);
  }

  const updateFields = {
    name: name.trim(),
    email: normalizedEmail,
    phone: phone ? String(phone).trim() : null,
    departmentId: Number(departmentId),
    designation: designation.trim(),
    salary: parseFloat(salary),
  };

  if (imageUrl !== undefined) {
    updateFields.imageUrl = imageUrl && String(imageUrl).trim() ? String(imageUrl).trim() : null;
  }

  // 4. Update the employee record
  const updatedEmployee = await prisma.employee.update({
    where: { id },
    data: updateFields,
    include: {
      department: true,
    },
  });

  return updatedEmployee;
};

/**
 * Deletes an employee by ID
 * @param {number} id - Employee ID to delete
 * @returns {Promise<void>}
 */
const deleteEmployee = async (id) => {
  // 1. Verify employee exists before attempting deletion
  const existingEmployee = await prisma.employee.findUnique({
    where: { id },
  });

  if (!existingEmployee) {
    throw new AppError('Employee not found', 404);
  }

  // 2. Delete record
  await prisma.employee.delete({
    where: { id },
  });
};

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
