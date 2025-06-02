import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Check authentication and admin role
    const authCookie = request.cookies.get('auth');
    if (!authCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(decodeURIComponent(authCookie.value));
    } catch (error) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    if (!session?.user?.id || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Mock data for recent messages
    // In a real application, this would be a database query
    const recentMessages = [
      {
        id: '1',
        sender: {
          firstName: 'Alice',
          lastName: 'Cooper',
          email: 'alice.cooper@example.com',
          id: 'user1',
          role: 'CUSTOMER'
        },
        content: 'I need help with my booking cancellation. The property owner is not responding.',
        type: 'SUPPORT_TICKET',
        priority: 'HIGH',
        status: 'OPEN',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        category: 'BOOKING_ISSUE'
      },
      {
        id: '2',
        sender: {
          firstName: 'Bob',
          lastName: 'Johnson',
          email: 'bob.johnson@example.com',
          id: 'user2',
          role: 'PROPERTY_MANAGER'
        },
        content: 'My property verification has been pending for over a week. Can you please review it?',
        type: 'VERIFICATION_INQUIRY',
        priority: 'MEDIUM',
        status: 'OPEN',
        read: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        category: 'VERIFICATION'
      },
      {
        id: '3',
        sender: {
          firstName: 'Carol',
          lastName: 'Smith',
          email: 'carol.smith@example.com',
          id: 'user3',
          role: 'CUSTOMER'
        },
        content: 'The payment for my booking failed but the money was deducted from my account.',
        type: 'PAYMENT_ISSUE',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        read: true,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        category: 'PAYMENT'
      },
      {
        id: '4',
        sender: {
          firstName: 'David',
          lastName: 'Brown',
          email: 'david.brown@example.com',
          id: 'user4',
          role: 'PROPERTY_MANAGER'
        },
        content: 'I would like to upgrade my subscription plan. What are the available options?',
        type: 'SUBSCRIPTION_INQUIRY',
        priority: 'LOW',
        status: 'OPEN',
        read: true,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        category: 'SUBSCRIPTION'
      },
      {
        id: '5',
        sender: {
          firstName: 'Emma',
          lastName: 'Wilson',
          email: 'emma.wilson@example.com',
          id: 'user5',
          role: 'CUSTOMER'
        },
        content: 'I found a bug in the mobile app when trying to filter properties by price range.',
        type: 'BUG_REPORT',
        priority: 'MEDIUM',
        status: 'OPEN',
        read: false,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        category: 'TECHNICAL'
      },
      {
        id: '6',
        sender: {
          firstName: 'Frank',
          lastName: 'Davis',
          email: 'frank.davis@example.com',
          id: 'user6',
          role: 'PROPERTY_MANAGER'
        },
        content: 'Can you help me understand the commission structure for premium listings?',
        type: 'GENERAL_INQUIRY',
        priority: 'LOW',
        status: 'RESOLVED',
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        category: 'BILLING'
      }
    ];

    return NextResponse.json(recentMessages);
  } catch (error) {
    console.error('Error fetching recent messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 