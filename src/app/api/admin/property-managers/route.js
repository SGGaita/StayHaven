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

    // Mock data for property managers
    // In a real application, this would be a database query
    const propertyManagers = [
      {
        id: 'pm1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '+1 (555) 123-4567',
        status: 'ACTIVE',
        businessName: 'Smith Property Management',
        businessType: 'LLC',
        taxId: '12-3456789',
        documentsSubmitted: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
        address: {
          street: '123 Business Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        monthlyRevenue: 15750.00,
        totalBookings: 45,
        averageRating: 4.8,
        properties: {
          total: 8,
          active: 7,
          list: [
            {
              id: 'prop1',
              name: 'Luxury Downtown Apartment',
              address: '123 Main St, New York, NY',
              price: 250,
              bedrooms: 2,
              bathrooms: 2,
              status: 'ACTIVE',
              bookings: 12
            },
            {
              id: 'prop2',
              name: 'Cozy Studio in SoHo',
              address: '456 Broadway, New York, NY',
              price: 180,
              bedrooms: 1,
              bathrooms: 1,
              status: 'ACTIVE',
              bookings: 8
            }
          ]
        }
      },
      {
        id: 'pm2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+1 (555) 234-5678',
        status: 'PENDING_APPROVAL',
        businessName: 'Johnson Hospitality Group',
        businessType: 'Corporation',
        taxId: '23-4567890',
        documentsSubmitted: true,
        emailVerified: true,
        phoneVerified: false,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        address: {
          street: '456 Corporate Blvd',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        },
        monthlyRevenue: 0,
        totalBookings: 0,
        averageRating: null,
        properties: {
          total: 3,
          active: 0,
          list: [
            {
              id: 'prop3',
              name: 'Beach House Malibu',
              address: '789 Ocean Dr, Malibu, CA',
              price: 450,
              bedrooms: 4,
              bathrooms: 3,
              status: 'PENDING_VERIFICATION',
              bookings: 0
            }
          ]
        }
      },
      {
        id: 'pm3',
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@example.com',
        phone: '+1 (555) 345-6789',
        status: 'ACTIVE',
        businessName: 'Brown Real Estate Solutions',
        businessType: 'Partnership',
        taxId: '34-5678901',
        documentsSubmitted: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 days ago
        address: {
          street: '789 Investment Way',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA'
        },
        monthlyRevenue: 22400.00,
        totalBookings: 67,
        averageRating: 4.6,
        properties: {
          total: 12,
          active: 11,
          list: [
            {
              id: 'prop4',
              name: 'Chicago Loft Downtown',
              address: '321 State St, Chicago, IL',
              price: 200,
              bedrooms: 2,
              bathrooms: 2,
              status: 'ACTIVE',
              bookings: 15
            },
            {
              id: 'prop5',
              name: 'Lakefront Condo',
              address: '654 Lake Shore Dr, Chicago, IL',
              price: 320,
              bedrooms: 3,
              bathrooms: 2,
              status: 'ACTIVE',
              bookings: 18
            }
          ]
        }
      },
      {
        id: 'pm4',
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@example.com',
        phone: '+1 (555) 456-7890',
        status: 'SUSPENDED',
        businessName: 'Davis Property Rentals',
        businessType: 'Sole Proprietorship',
        taxId: '45-6789012',
        documentsSubmitted: false,
        emailVerified: true,
        phoneVerified: true,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
        address: {
          street: '987 Residential Ln',
          city: 'Miami',
          state: 'FL',
          zipCode: '33101',
          country: 'USA'
        },
        monthlyRevenue: 0,
        totalBookings: 23,
        averageRating: 3.2,
        properties: {
          total: 5,
          active: 0,
          list: [
            {
              id: 'prop6',
              name: 'Miami Beach Apartment',
              address: '147 Ocean Ave, Miami Beach, FL',
              price: 280,
              bedrooms: 2,
              bathrooms: 2,
              status: 'SUSPENDED',
              bookings: 0
            }
          ]
        }
      },
      {
        id: 'pm5',
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@example.com',
        phone: '+1 (555) 567-8901',
        status: 'PENDING_VERIFICATION',
        businessName: 'Wilson Vacation Homes',
        businessType: 'LLC',
        taxId: '56-7890123',
        documentsSubmitted: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
        address: {
          street: '258 Mountain View Rd',
          city: 'Denver',
          state: 'CO',
          zipCode: '80201',
          country: 'USA'
        },
        monthlyRevenue: 8900.00,
        totalBookings: 12,
        averageRating: 4.9,
        properties: {
          total: 4,
          active: 3,
          list: [
            {
              id: 'prop7',
              name: 'Mountain Cabin Retreat',
              address: '369 Pine St, Aspen, CO',
              price: 380,
              bedrooms: 3,
              bathrooms: 2,
              status: 'ACTIVE',
              bookings: 8
            }
          ]
        }
      },
      {
        id: 'pm6',
        firstName: 'Lisa',
        lastName: 'Wang',
        email: 'lisa.wang@example.com',
        phone: '+1 (555) 678-9012',
        status: 'ACTIVE',
        businessName: 'Wang Hospitality Services',
        businessType: 'Corporation',
        taxId: '67-8901234',
        documentsSubmitted: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days ago
        address: {
          street: '741 Tech Blvd',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA'
        },
        monthlyRevenue: 31200.00,
        totalBookings: 89,
        averageRating: 4.7,
        properties: {
          total: 15,
          active: 14,
          list: [
            {
              id: 'prop8',
              name: 'Victorian Home in Castro',
              address: '852 Castro St, San Francisco, CA',
              price: 420,
              bedrooms: 4,
              bathrooms: 3,
              status: 'ACTIVE',
              bookings: 22
            },
            {
              id: 'prop9',
              name: 'Modern Loft SOMA',
              address: '963 Folsom St, San Francisco, CA',
              price: 350,
              bedrooms: 2,
              bathrooms: 2,
              status: 'ACTIVE',
              bookings: 19
            }
          ]
        }
      }
    ];

    return NextResponse.json(propertyManagers);
  } catch (error) {
    console.error('Error fetching property managers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 