const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUsers() {
  try {
    const password = 'StayHaven@2024';
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Admin users to create
    const users = [
      {
        email: 'admin@stayhaven.com',
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      },
      {
        email: 'steveggaikia@gmail.com',
        firstName: 'Steve',
        lastName: 'Gaikia',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      }
    ];
    
    // Create users
    for (const userData of users) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      
      if (existingUser) {
        console.log(`User ${userData.email} already exists. Updating role to SUPER_ADMIN.`);
        const updatedUser = await prisma.user.update({
          where: { email: userData.email },
          data: { 
            role: 'SUPER_ADMIN',
            password: hashedPassword 
          }
        });
        console.log(`Updated user: ${updatedUser.email}`);
      } else {
        const newUser = await prisma.user.create({
          data: userData
        });
        console.log(`Created new user: ${newUser.email}`);
      }
    }
    
    console.log('Super admin users created or updated successfully!');
  } catch (error) {
    console.error('Error creating admin users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUsers(); 