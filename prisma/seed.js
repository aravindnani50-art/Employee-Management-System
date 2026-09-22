// Database Seeding Script
// Populates the PostgreSQL database with initial departments and realistic dummy employees.
// Run with: npm run prisma:seed

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing records in proper dependency order (child first, then parent)
  console.log('🧹 Cleaning existing records...');
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();

  // 2. Seed Departments
  console.log('🏢 Seeding departments...');
  const departmentsData = [
    { name: 'Engineering' },
    { name: 'Human Resources' },
    { name: 'Finance' },
    { name: 'Marketing' },
    { name: 'Operations' },
  ];

  const createdDepartments = {};
  for (const dept of departmentsData) {
    const record = await prisma.department.create({ data: dept });
    createdDepartments[dept.name] = record.id;
  }
  console.log(`✅ Created ${Object.keys(createdDepartments).length} departments.`);

  // 3. Seed Realistic Dummy Employees
  console.log('👥 Seeding employees...');
  const employeesData = [
    {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      phone: '9876543210',
      departmentId: createdDepartments['Engineering'],
      designation: 'Senior Full-Stack Developer',
      salary: 95000,
    },
    {
      name: 'Priya Patel',
      email: 'priya.patel@example.com',
      phone: '9876543211',
      departmentId: createdDepartments['Engineering'],
      designation: 'Frontend Engineer',
      salary: 72000,
    },
    {
      name: 'Rahul Kumar',
      email: 'rahul.kumar@example.com',
      phone: '9876543212',
      departmentId: createdDepartments['Engineering'],
      designation: 'Backend Developer',
      salary: 80000,
    },
    {
      name: 'Sneha Verma',
      email: 'sneha.verma@example.com',
      phone: '9876543213',
      departmentId: createdDepartments['Engineering'],
      designation: 'DevOps Engineer',
      salary: 88000,
    },
    {
      name: 'Ananya Gupta',
      email: 'ananya.gupta@example.com',
      phone: '9876543214',
      departmentId: createdDepartments['Human Resources'],
      designation: 'HR Specialist',
      salary: 58000,
    },
    {
      name: 'Rohan Mehta',
      email: 'rohan.mehta@example.com',
      phone: '9876543215',
      departmentId: createdDepartments['Human Resources'],
      designation: 'Talent Acquisition Lead',
      salary: 68000,
    },
    {
      name: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      phone: '9876543216',
      departmentId: createdDepartments['Finance'],
      designation: 'Senior Financial Analyst',
      salary: 92000,
    },
    {
      name: 'Neha Joshi',
      email: 'neha.joshi@example.com',
      phone: '9876543217',
      departmentId: createdDepartments['Finance'],
      designation: 'Accountant',
      salary: 54000,
    },
    {
      name: 'Aditya Nair',
      email: 'aditya.nair@example.com',
      phone: '9876543218',
      departmentId: createdDepartments['Marketing'],
      designation: 'Marketing Strategist',
      salary: 75000,
    },
    {
      name: 'Pooja Iyer',
      email: 'pooja.iyer@example.com',
      phone: '9876543219',
      departmentId: createdDepartments['Marketing'],
      designation: 'Content Lead',
      salary: 62000,
    },
    {
      name: 'Manish Reddy',
      email: 'manish.reddy@example.com',
      phone: '9876543220',
      departmentId: createdDepartments['Operations'],
      designation: 'Operations Coordinator',
      salary: 56000,
    },
    {
      name: 'Kavita Rao',
      email: 'kavita.rao@example.com',
      phone: '9876543221',
      departmentId: createdDepartments['Operations'],
      designation: 'Operations Manager',
      salary: 86000,
    },
    {
      name: 'Kunal Deshmukh',
      email: 'kunal.deshmukh@example.com',
      phone: '9876543222',
      departmentId: createdDepartments['Engineering'],
      designation: 'QA Automation Engineer',
      salary: 68000,
    },
    {
      name: 'Tanvi Saxena',
      email: 'tanvi.saxena@example.com',
      phone: '9876543223',
      departmentId: createdDepartments['Engineering'],
      designation: 'Cloud Solutions Architect',
      salary: 115000,
    },
    {
      name: 'Arjun Das',
      email: 'arjun.das@example.com',
      phone: '9876543224',
      departmentId: createdDepartments['Marketing'],
      designation: 'SEO Specialist',
      salary: 50000,
    },
    {
      name: 'Ritu Malhotra',
      email: 'ritu.malhotra@example.com',
      phone: '9876543225',
      departmentId: createdDepartments['Finance'],
      designation: 'Payroll Manager',
      salary: 71000,
    },
  ];

  for (const emp of employeesData) {
    await prisma.employee.create({ data: emp });
  }

  console.log(`✅ Seeded ${employeesData.length} employees successfully.`);
  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
