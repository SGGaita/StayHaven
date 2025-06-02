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

    // Mock data for accounts due
    // In a real application, this would be a database query
    const accountsDue = [
      {
        id: '1',
        user: {
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@example.com',
          id: 'user1'
        },
        amount: 299.99,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        status: 'OVERDUE',
        invoiceNumber: 'INV-2024-001',
        description: 'Monthly subscription fee'
      },
      {
        id: '2',
        user: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@example.com',
          id: 'user2'
        },
        amount: 199.99,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        status: 'DUE_SOON',
        invoiceNumber: 'INV-2024-002',
        description: 'Monthly subscription fee'
      },
      {
        id: '3',
        user: {
          firstName: 'Michael',
          lastName: 'Brown',
          email: 'michael.brown@example.com',
          id: 'user3'
        },
        amount: 399.99,
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        status: 'OVERDUE',
        invoiceNumber: 'INV-2024-003',
        description: 'Premium subscription fee'
      },
      {
        id: '4',
        user: {
          firstName: 'Emily',
          lastName: 'Davis',
          email: 'emily.davis@example.com',
          id: 'user4'
        },
        amount: 149.99,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        status: 'DUE_SOON',
        invoiceNumber: 'INV-2024-004',
        description: 'Basic subscription fee'
      },
      {
        id: '5',
        user: {
          firstName: 'David',
          lastName: 'Wilson',
          email: 'david.wilson@example.com',
          id: 'user5'
        },
        amount: 599.99,
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        status: 'OVERDUE',
        invoiceNumber: 'INV-2024-005',
        description: 'Enterprise subscription fee'
      }
    ];

    return NextResponse.json(accountsDue);
  } catch (error) {
    console.error('Error fetching accounts due:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 