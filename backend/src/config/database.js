// Database Configuration using Prisma ORM
// This file initializes and exports a single PrismaClient instance.
// Reusing a single instance prevents exhausting the database connection pool.

const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

module.exports = prisma;
