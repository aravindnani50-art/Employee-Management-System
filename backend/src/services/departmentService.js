// Department Service
// Handles database operations for Departments using Prisma ORM.

const prisma = require('../config/database');

/**
 * Retrieves all departments ordered alphabetically by name
 * @returns {Promise<Array>} List of department objects
 */
const getAllDepartments = async () => {
  return await prisma.department.findMany({
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });
};

/**
 * Checks if a department exists by ID
 * @param {number} departmentId 
 * @returns {Promise<boolean>}
 */
const departmentExists = async (departmentId) => {
  const count = await prisma.department.count({
    where: { id: departmentId },
  });
  return count > 0;
};

module.exports = {
  getAllDepartments,
  departmentExists,
};
