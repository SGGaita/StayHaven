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

    // Mock data for pending verifications
    // In a real application, this would be a database query
    const pendingVerifications = [
      {
        id: 'prop1',
        name: 'Luxury Downtown Apartment',
        description: 'Beautiful 2-bedroom apartment in the heart of downtown with stunning city views.',
        owner: {
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@example.com',
          id: 'user1'
        },
        photos: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'
        ],
        address: {
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        price: 250,
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'Parking'],
        status: 'PENDING_VERIFICATION',
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        verificationNotes: 'Initial submission - requires document verification'
      },
      {
        id: 'prop2',
        name: 'Cozy Beach House',
        description: 'Charming beach house just steps away from the ocean with private deck.',
        owner: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@example.com',
          id: 'user2'
        },
        photos: [
          'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400'
        ],
        address: {
          street: '456 Ocean Drive',
          city: 'Miami Beach',
          state: 'FL',
          zipCode: '33139',
          country: 'USA'
        },
        price: 180,
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        amenities: ['WiFi', 'Kitchen', 'Beach Access', 'Parking', 'Hot Tub'],
        status: 'PENDING_VERIFICATION',
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        verificationNotes: 'Resubmission after address correction'
      },
      {
        id: 'prop3',
        name: 'Mountain Cabin Retreat',
        description: 'Rustic cabin in the mountains perfect for a peaceful getaway.',
        owner: {
          firstName: 'Michael',
          lastName: 'Brown',
          email: 'michael.brown@example.com',
          id: 'user3'
        },
        photos: [
          'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
        ],
        address: {
          street: '789 Mountain Road',
          city: 'Aspen',
          state: 'CO',
          zipCode: '81611',
          country: 'USA'
        },
        price: 320,
        bedrooms: 4,
        bathrooms: 3,
        maxGuests: 8,
        amenities: ['WiFi', 'Kitchen', 'Fireplace', 'Parking', 'Mountain View'],
        status: 'PENDING_VERIFICATION',
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        verificationNotes: 'New submission - all documents provided'
      },
      {
        id: 'prop4',
        name: 'Urban Loft Studio',
        description: 'Modern loft studio in trendy neighborhood with exposed brick walls.',
        owner: {
          firstName: 'Emily',
          lastName: 'Davis',
          email: 'emily.davis@example.com',
          id: 'user4'
        },
        photos: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400'
        ],
        address: {
          street: '321 Industrial Blvd',
          city: 'Portland',
          state: 'OR',
          zipCode: '97201',
          country: 'USA'
        },
        price: 120,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'Gym Access'],
        status: 'PENDING_VERIFICATION',
        submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        verificationNotes: 'Pending insurance documentation'
      },
      {
        id: 'prop5',
        name: 'Historic Victorian Home',
        description: 'Beautifully restored Victorian home with original architectural details.',
        owner: {
          firstName: 'David',
          lastName: 'Wilson',
          email: 'david.wilson@example.com',
          id: 'user5'
        },
        photos: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
          'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400'
        ],
        address: {
          street: '654 Heritage Lane',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA'
        },
        price: 400,
        bedrooms: 5,
        bathrooms: 4,
        maxGuests: 10,
        amenities: ['WiFi', 'Kitchen', 'Garden', 'Parking', 'Historic Features'],
        status: 'PENDING_VERIFICATION',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        verificationNotes: 'Historic property - requires special permits verification'
      }
    ];

    return NextResponse.json(pendingVerifications);
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 