import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Mock property manager data - replace with actual database query
    const mockPropertyManager = {
      id: id,
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '+1 (555) 123-4567',
      status: 'ACTIVE',
      businessName: 'Smith Property Management LLC',
      businessType: 'LLC',
      taxId: '12-3456789',
      businessLicense: 'BL-2024-001',
      emailVerified: true,
      phoneVerified: true,
      documentsSubmitted: true,
      backgroundCheckPassed: true,
      createdAt: '2024-01-15T10:30:00Z',
      address: {
        street: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zipCode: '94102'
      },
      properties: {
        total: 5,
        active: 4,
        list: [
          {
            id: '1',
            name: 'Luxury Downtown Apartment',
            address: '456 Market Street, San Francisco, CA',
            status: 'ACTIVE',
            bedrooms: 2,
            bathrooms: 2,
            guests: 4,
            price: 250,
            bookings: 45,
            photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400']
          },
          {
            id: '2',
            name: 'Cozy Studio Near Union Square',
            address: '789 Powell Street, San Francisco, CA',
            status: 'ACTIVE',
            bedrooms: 1,
            bathrooms: 1,
            guests: 2,
            price: 180,
            bookings: 32,
            photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400']
          },
          {
            id: '3',
            name: 'Modern Loft in SOMA',
            address: '321 Folsom Street, San Francisco, CA',
            status: 'ACTIVE',
            bedrooms: 1,
            bathrooms: 1,
            guests: 3,
            price: 220,
            bookings: 28,
            photos: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400']
          },
          {
            id: '4',
            name: 'Spacious Family Home',
            address: '654 Castro Street, San Francisco, CA',
            status: 'ACTIVE',
            bedrooms: 3,
            bathrooms: 2,
            guests: 6,
            price: 350,
            bookings: 22,
            photos: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400']
          },
          {
            id: '5',
            name: 'Penthouse with Bay View',
            address: '987 Nob Hill, San Francisco, CA',
            status: 'PENDING',
            bedrooms: 3,
            bathrooms: 3,
            guests: 8,
            price: 500,
            bookings: 0,
            photos: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400']
          }
        ]
      },
      monthlyRevenue: 15750,
      totalRevenue: 125000,
      totalBookings: 127,
      averageRating: 4.7,
      avgBookingValue: 984,
      repeatGuestRate: 35,
      occupancyRate: 78,
      responseRate: 92,
      guestSatisfaction: 4.6
    };

    return NextResponse.json(mockPropertyManager);
  } catch (error) {
    console.error('Error fetching property manager details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property manager details' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, reason } = body;

    // Mock status update - replace with actual database update
    console.log(`Updating property manager ${id} status to ${status} with reason: ${reason}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Property manager status updated successfully' 
    });
  } catch (error) {
    console.error('Error updating property manager status:', error);
    return NextResponse.json(
      { error: 'Failed to update property manager status' },
      { status: 500 }
    );
  }
} 