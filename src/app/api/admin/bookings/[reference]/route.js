import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
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

    const { reference } = params;

    // Mock booking data based on reference
    // In a real application, this would be a database query
    const mockBookings = {
      'BK-2024-001': {
        id: 'booking1',
        reference: 'BK-2024-001',
        status: 'DISPUTED',
        checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
        guests: 2,
        nights: 3,
        subtotal: 750.00,
        serviceFee: 75.00,
        taxes: 67.50,
        totalAmount: 892.50,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        guest: {
          id: 'guest1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          joinedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ago
        },
        property: {
          id: 'prop1',
          name: 'Luxury Downtown Apartment',
          address: '123 Main Street, New York, NY 10001',
          bedrooms: 2,
          bathrooms: 2,
          host: {
            id: 'host1',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.johnson@example.com',
            phone: '+1 (555) 234-5678'
          }
        },
        dispute: {
          id: 'dispute1',
          status: 'OPEN',
          category: 'Property not as described',
          description: 'The apartment was not clean upon arrival and several amenities mentioned in the listing were not available. The WiFi was not working and the air conditioning was broken.',
          reportedBy: 'Guest',
          reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          messages: [
            {
              id: 'msg1',
              sender: 'guest',
              senderName: 'John Doe',
              content: 'I arrived at the property and it was not as described. The place was dirty and the WiFi is not working.',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'msg2',
              sender: 'host',
              senderName: 'Sarah Johnson',
              content: 'I apologize for the inconvenience. Our cleaning service had an issue. I can arrange for immediate cleaning and WiFi repair.',
              timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'msg3',
              sender: 'guest',
              senderName: 'John Doe',
              content: 'The cleaning was done but the WiFi is still not working. This is affecting my work. I would like a partial refund.',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        }
      },
      'BK-2024-002': {
        id: 'booking2',
        reference: 'BK-2024-002',
        status: 'DISPUTED',
        checkIn: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        checkOut: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
        guests: 4,
        nights: 7,
        subtotal: 1400.00,
        serviceFee: 140.00,
        taxes: 138.60,
        totalAmount: 1678.60,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        guest: {
          id: 'guest2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+1 (555) 987-6543',
          joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months ago
        },
        property: {
          id: 'prop2',
          name: 'Cozy Beach House',
          address: '456 Ocean Drive, Miami Beach, FL 33139',
          bedrooms: 3,
          bathrooms: 2,
          host: {
            id: 'host2',
            firstName: 'Michael',
            lastName: 'Brown',
            email: 'michael.brown@example.com',
            phone: '+1 (555) 345-6789'
          }
        },
        dispute: {
          id: 'dispute2',
          status: 'IN_PROGRESS',
          category: 'Cancellation dispute',
          description: 'Guest wants to cancel due to family emergency but is outside the cancellation policy window. Requesting full refund.',
          reportedBy: 'Guest',
          reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          messages: [
            {
              id: 'msg4',
              sender: 'guest',
              senderName: 'Jane Smith',
              content: 'I have a family emergency and need to cancel my booking. I understand it\'s outside the policy but this is an exceptional circumstance.',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'msg5',
              sender: 'admin',
              senderName: 'Admin Support',
              content: 'We understand this is a difficult situation. We are reviewing your case and will get back to you within 24 hours.',
              timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
            }
          ]
        }
      },
      'BK-2024-003': {
        id: 'booking3',
        reference: 'BK-2024-003',
        status: 'COMPLETED',
        checkIn: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
        checkOut: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(), // 11 days ago
        guests: 2,
        nights: 3,
        subtotal: 600.00,
        serviceFee: 60.00,
        taxes: 59.40,
        totalAmount: 719.40,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
        guest: {
          id: 'guest3',
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike.johnson@example.com',
          phone: '+1 (555) 456-7890',
          joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months ago
        },
        property: {
          id: 'prop3',
          name: 'Mountain Cabin Retreat',
          address: '789 Mountain Road, Aspen, CO 81611',
          bedrooms: 2,
          bathrooms: 1,
          host: {
            id: 'host3',
            firstName: 'Emily',
            lastName: 'Davis',
            email: 'emily.davis@example.com',
            phone: '+1 (555) 567-8901'
          }
        },
        dispute: {
          id: 'dispute3',
          status: 'RESOLVED',
          category: 'Payment issue',
          description: 'Payment was charged twice due to a technical error. Customer requested refund for the duplicate charge.',
          reportedBy: 'Guest',
          reportedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
          messages: [
            {
              id: 'msg6',
              sender: 'guest',
              senderName: 'Mike Johnson',
              content: 'I was charged twice for my booking. Can you please refund the duplicate charge?',
              timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'msg7',
              sender: 'admin',
              senderName: 'Admin Support',
              content: 'We have identified the duplicate charge and processed a refund. You should see it in your account within 3-5 business days.',
              timestamp: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          resolution: {
            type: 'PARTIAL_REFUND',
            amount: 719.40,
            details: 'Refunded duplicate charge due to technical error. Customer was charged twice for the same booking.',
            resolvedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
            resolvedBy: 'admin'
          }
        }
      }
    };

    const booking = mockBookings[reference];
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 