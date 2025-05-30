const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create a customer
  const customer = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'customer@test.com',
      password: hashedPassword,
      role: 'CUSTOMER',
      verificationStatus: 'VERIFIED',
      profileInfo: {
        bio: 'Love traveling and exploring new places!',
        location: 'New York, NY',
        joinedDate: new Date().toISOString(),
        avatarUrl: '/default-avatar.png'
      }
    }
  });

  // Create a property manager
  const manager = await prisma.user.upsert({
    where: { email: 'manager@test.com' },
    update: {},
    create: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'manager@test.com',
      password: hashedPassword,
      role: 'PROPERTY_MANAGER',
      verificationStatus: 'VERIFIED',
      profileInfo: {
        bio: 'Experienced property manager with 10+ years in hospitality.',
        location: 'Los Angeles, CA',
        joinedDate: new Date().toISOString(),
        avatarUrl: '/default-avatar.png'
      }
    }
  });

  // Create test properties
  const property1 = await prisma.property.upsert({
    where: { id: 'prop-1' },
    update: {},
    create: {
      id: 'prop-1',
      name: 'Luxury Downtown Apartment',
      description: 'Beautiful modern apartment in the heart of downtown with stunning city views.',
      location: 'New York, NY',
      propertyType: 'Apartment',
      managerId: manager.id,
      status: 'ACTIVE',
      price: 150.00,
      cleaningFee: 25.00,
      securityDeposit: 100.00,
      bedrooms: 2,
      beds: 2,
      bathrooms: 2,
      maxGuests: 4,
      photos: ['/placeholder-property.jpg'],
      amenities: {
        wifi: true,
        kitchen: true,
        parking: true,
        pool: false,
        gym: true,
        airConditioning: true
      },
      lat: 40.7128,
      lng: -74.0060
    }
  });

  const property2 = await prisma.property.upsert({
    where: { id: 'prop-2' },
    update: {},
    create: {
      id: 'prop-2',
      name: 'Cozy Beach House',
      description: 'Charming beach house just steps from the ocean.',
      location: 'Miami, FL',
      propertyType: 'House',
      managerId: manager.id,
      status: 'ACTIVE',
      price: 200.00,
      cleaningFee: 30.00,
      securityDeposit: 150.00,
      bedrooms: 3,
      beds: 3,
      bathrooms: 2,
      maxGuests: 6,
      photos: ['/placeholder-property.jpg'],
      amenities: {
        wifi: true,
        kitchen: true,
        parking: true,
        pool: true,
        gym: false,
        airConditioning: true
      },
      lat: 25.7617,
      lng: -80.1918
    }
  });

  const property3 = await prisma.property.upsert({
    where: { id: 'prop-3' },
    update: {},
    create: {
      id: 'prop-3',
      name: 'Mountain Cabin Retreat',
      description: 'Peaceful cabin in the mountains, perfect for a getaway.',
      location: 'Aspen, CO',
      propertyType: 'Cabin',
      managerId: manager.id,
      status: 'ACTIVE',
      price: 120.00,
      cleaningFee: 20.00,
      securityDeposit: 80.00,
      bedrooms: 2,
      beds: 2,
      bathrooms: 1,
      maxGuests: 4,
      photos: ['/placeholder-property.jpg'],
      amenities: {
        wifi: true,
        kitchen: true,
        parking: true,
        pool: false,
        gym: false,
        airConditioning: false
      },
      lat: 39.1911,
      lng: -106.8175
    }
  });

  // Create test bookings for the customer
  const bookings = [
    {
      id: 'booking-1',
      bookingRef: 'BK-1705123456-ABC',
      propertyId: property1.id,
      customerId: customer.id,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-01-18'),
      status: 'COMPLETED',
      price: 450.00,
      guests: 2,
      subtotal: 450.00,
      cleaningFee: 25.00,
      serviceFee: 36.00,
      securityDeposit: 100.00,
      createdAt: new Date('2024-01-10')
    },
    {
      id: 'booking-2',
      bookingRef: 'BK-1704987654-DEF',
      propertyId: property2.id,
      customerId: customer.id,
      startDate: new Date('2024-01-10'),
      endDate: new Date('2024-01-12'),
      status: 'COMPLETED',
      price: 400.00,
      guests: 4,
      subtotal: 400.00,
      cleaningFee: 30.00,
      serviceFee: 32.00,
      securityDeposit: 150.00,
      createdAt: new Date('2024-01-05')
    },
    {
      id: 'booking-3',
      bookingRef: 'BK-1704567890-GHI',
      propertyId: property3.id,
      customerId: customer.id,
      startDate: new Date('2024-02-05'),
      endDate: new Date('2024-02-07'),
      status: 'CONFIRMED',
      price: 240.00,
      guests: 2,
      subtotal: 240.00,
      cleaningFee: 20.00,
      serviceFee: 19.20,
      securityDeposit: 80.00,
      createdAt: new Date('2024-01-25')
    },
    {
      id: 'booking-4',
      bookingRef: 'BK-1703456789-JKL',
      propertyId: property1.id,
      customerId: customer.id,
      startDate: new Date('2023-12-20'),
      endDate: new Date('2023-12-23'),
      status: 'COMPLETED',
      price: 450.00,
      guests: 2,
      subtotal: 450.00,
      cleaningFee: 25.00,
      serviceFee: 36.00,
      securityDeposit: 100.00,
      createdAt: new Date('2023-12-15')
    },
    {
      id: 'booking-5',
      bookingRef: 'BK-1702345678-MNO',
      propertyId: property2.id,
      customerId: customer.id,
      startDate: new Date('2023-11-15'),
      endDate: new Date('2023-11-18'),
      status: 'COMPLETED',
      price: 600.00,
      guests: 4,
      subtotal: 600.00,
      cleaningFee: 30.00,
      serviceFee: 48.00,
      securityDeposit: 150.00,
      createdAt: new Date('2023-11-10')
    }
  ];

  for (const booking of bookings) {
    await prisma.booking.upsert({
      where: { id: booking.id },
      update: {},
      create: booking
    });
  }

  // Create test notifications
  const notifications = [
    {
      id: 'notif-1',
      userId: customer.id,
      type: 'BOOKING_CONFIRMED',
      title: 'Booking Confirmed',
      message: 'Your booking for Luxury Downtown Apartment has been confirmed!',
      isRead: false,
      data: {
        bookingId: 'booking-1',
        propertyName: 'Luxury Downtown Apartment'
      },
      createdAt: new Date('2024-01-10')
    },
    {
      id: 'notif-2',
      userId: customer.id,
      type: 'PAYMENT_RECEIVED',
      title: 'Payment Received',
      message: 'We have received your payment of $450.00 for your upcoming stay.',
      isRead: false,
      data: {
        amount: 450.00,
        bookingId: 'booking-1'
      },
      createdAt: new Date('2024-01-11')
    },
    {
      id: 'notif-3',
      userId: customer.id,
      type: 'CHECK_IN_REMINDER',
      title: 'Check-in Reminder',
      message: 'Your check-in for Mountain Cabin Retreat is tomorrow at 3:00 PM.',
      isRead: true,
      data: {
        bookingId: 'booking-3',
        propertyName: 'Mountain Cabin Retreat',
        checkInTime: '3:00 PM'
      },
      createdAt: new Date('2024-02-04')
    },
    {
      id: 'notif-4',
      userId: customer.id,
      type: 'REVIEW_REQUEST',
      title: 'Review Your Stay',
      message: 'How was your stay at Cozy Beach House? Please leave a review.',
      isRead: false,
      data: {
        bookingId: 'booking-2',
        propertyName: 'Cozy Beach House'
      },
      createdAt: new Date('2024-01-13')
    },
    {
      id: 'notif-5',
      userId: customer.id,
      type: 'SPECIAL_OFFER',
      title: 'Special Offer',
      message: 'Get 20% off your next booking! Use code SAVE20 at checkout.',
      isRead: true,
      data: {
        discountCode: 'SAVE20',
        discountPercent: 20
      },
      createdAt: new Date('2024-01-20')
    }
  ];

  for (const notification of notifications) {
    await prisma.notification.upsert({
      where: { id: notification.id },
      update: {},
      create: notification
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log('📧 Test accounts created:');
  console.log('   Customer: customer@test.com / password123');
  console.log('   Manager: manager@test.com / password123');
  console.log(`📊 Created ${bookings.length} test bookings for customer`);
  console.log(`🔔 Created ${notifications.length} test notifications for customer`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 