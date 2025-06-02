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

    // Mock data for new accounts
    // In a real application, this would be a database query
    const newAccounts = [
      {
        id: 'user1',
        firstName: 'Jennifer',
        lastName: 'Martinez',
        email: 'jennifer.martinez@example.com',
        role: 'PROPERTY_MANAGER',
        status: 'PENDING_APPROVAL',
        registeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        emailVerified: true,
        phoneVerified: false,
        documentsSubmitted: true,
        profileComplete: 85,
        businessName: 'Martinez Property Management',
        businessType: 'LLC',
        taxId: 'XX-XXXXXXX',
        address: {
          street: '123 Business Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        },
        requestedFeatures: ['Premium Listings', 'Analytics Dashboard', 'Multi-property Management']
      },
      {
        id: 'user2',
        firstName: 'Robert',
        lastName: 'Chen',
        email: 'robert.chen@example.com',
        role: 'PROPERTY_MANAGER',
        status: 'PENDING_VERIFICATION',
        registeredAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        emailVerified: true,
        phoneVerified: true,
        documentsSubmitted: false,
        profileComplete: 60,
        businessName: 'Chen Hospitality Group',
        businessType: 'Corporation',
        taxId: 'XX-XXXXXXX',
        address: {
          street: '456 Corporate Blvd',
          city: 'Seattle',
          state: 'WA',
          zipCode: '98101',
          country: 'USA'
        },
        requestedFeatures: ['Enterprise Plan', 'API Access', 'White Label Solution']
      },
      {
        id: 'user3',
        firstName: 'Amanda',
        lastName: 'Thompson',
        email: 'amanda.thompson@example.com',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        registeredAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        emailVerified: true,
        phoneVerified: true,
        documentsSubmitted: false,
        profileComplete: 100,
        businessName: null,
        businessType: null,
        taxId: null,
        address: {
          street: '789 Residential St',
          city: 'Austin',
          state: 'TX',
          zipCode: '73301',
          country: 'USA'
        },
        requestedFeatures: []
      },
      {
        id: 'user4',
        firstName: 'Carlos',
        lastName: 'Rodriguez',
        email: 'carlos.rodriguez@example.com',
        role: 'PROPERTY_MANAGER',
        status: 'PENDING_APPROVAL',
        registeredAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        emailVerified: false,
        phoneVerified: false,
        documentsSubmitted: true,
        profileComplete: 45,
        businessName: 'Rodriguez Vacation Rentals',
        businessType: 'Sole Proprietorship',
        taxId: 'XX-XXXXXXX',
        address: {
          street: '321 Beach Road',
          city: 'San Diego',
          state: 'CA',
          zipCode: '92101',
          country: 'USA'
        },
        requestedFeatures: ['Basic Plan', 'Payment Processing']
      },
      {
        id: 'user5',
        firstName: 'Lisa',
        lastName: 'Wang',
        email: 'lisa.wang@example.com',
        role: 'PROPERTY_MANAGER',
        status: 'PENDING_VERIFICATION',
        registeredAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        emailVerified: true,
        phoneVerified: true,
        documentsSubmitted: true,
        profileComplete: 95,
        businessName: 'Wang Real Estate Solutions',
        businessType: 'Partnership',
        taxId: 'XX-XXXXXXX',
        address: {
          street: '654 Investment Way',
          city: 'Denver',
          state: 'CO',
          zipCode: '80201',
          country: 'USA'
        },
        requestedFeatures: ['Premium Plan', 'Advanced Analytics', 'Custom Branding']
      },
      {
        id: 'user6',
        firstName: 'Michael',
        lastName: 'O\'Connor',
        email: 'michael.oconnor@example.com',
        role: 'CUSTOMER',
        status: 'PENDING_VERIFICATION',
        registeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        emailVerified: true,
        phoneVerified: false,
        documentsSubmitted: false,
        profileComplete: 70,
        businessName: null,
        businessType: null,
        taxId: null,
        address: {
          street: '987 Family Lane',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA'
        },
        requestedFeatures: []
      }
    ];

    return NextResponse.json(newAccounts);
  } catch (error) {
    console.error('Error fetching new accounts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 