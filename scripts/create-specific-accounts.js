const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSpecificAccounts() {
  try {
    // Default password for all accounts
    const password = 'StayHaven@2024';
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Users to create
    const users = [
      {
        email: 'admin@stayhaven.com',
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        verificationStatus: 'VERIFIED',
      },
      {
        email: 'property@stayhaven.com',
        firstName: 'Property',
        lastName: 'Manager',
        password: hashedPassword,
        role: 'PROPERTY_MANAGER',
        verificationStatus: 'VERIFIED',
      },
      {
        email: 'customer@stayhaven.com',
        firstName: 'Customer',
        lastName: 'User',
        password: hashedPassword,
        role: 'CUSTOMER',
        verificationStatus: 'VERIFIED',
      }
    ];
    
    console.log('Creating specific accounts...');
    
    // Create users
    for (const userData of users) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        });
        
        if (existingUser) {
          console.log(`User ${userData.email} already exists. Updating details...`);
          const updatedUser = await prisma.user.update({
            where: { email: userData.email },
            data: { 
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userData.role,
              password: hashedPassword,
              verificationStatus: userData.verificationStatus
            }
          });
          console.log(`✅ Updated user: ${updatedUser.email} (Role: ${updatedUser.role})`);
        } else {
          const newUser = await prisma.user.create({
            data: userData
          });
          console.log(`✅ Created new user: ${newUser.email} (Role: ${newUser.role})`);
        }
      } catch (userError) {
        console.error(`❌ Error processing user ${userData.email}:`, userError.message);
      }
    }
    
    console.log('\n🎉 Specific accounts creation completed!');
    console.log('\nAccount Details:');
    console.log('1. admin@stayhaven.com - SUPER_ADMIN');
    console.log('2. property@stayhaven.com - PROPERTY_MANAGER');
    console.log('3. customer@stayhaven.com - CUSTOMER');
    console.log(`\nDefault password for all accounts: ${password}`);
    
  } catch (error) {
    console.error('❌ Error creating accounts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createSpecificAccounts(); 