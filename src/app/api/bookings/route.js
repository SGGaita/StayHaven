import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import serverLogger from '@/lib/server-logger';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    // Parse auth headers
    const authHeader = request.headers.get('Authorization');
    const userRole = request.headers.get('X-User-Role');
    const userId = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    // Debug auth data
    serverLogger.info('bookings-get', 'Auth check in GET bookings request', { 
      hasAuthHeader: !!authHeader,
      userId: userId || 'none',
      userRole: userRole || 'none',
    });
    
    // Require authentication
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Build query based on user role
    let query = {
      include: {
        property: {
          select: {
            id: true,
            name: true,
            location: true,
            photos: true,
            price: true,
          },
        },
        customer: {
          select: {
            id: true, 
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    };
    
    // Filter bookings based on user role
    if (userRole === 'CUSTOMER') {
      query.where = { customerId: userId };
    } else if (userRole === 'PROPERTY_MANAGER') {
      query.where = {
        property: {
          managerId: userId,
        },
      };
    }
    // For SUPER_ADMIN, no filter needed - they see all bookings
    
    const bookings = await prisma.booking.findMany(query);
    
    serverLogger.info('bookings-get', 'Bookings fetched successfully', {
      count: bookings.length,
      userId,
    });
    
    return NextResponse.json(bookings);
  } catch (error) {
    serverLogger.error('bookings-get', 'Error fetching bookings', {
      error: error.message,
      stack: error.stack,
    });
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('auth');
    
    if (!sessionCookie) {
      serverLogger.apiWarn('bookings', 'No session cookie found');
      return new NextResponse(
        JSON.stringify({ 
          error: 'Unauthorized access',
          details: 'Please sign in to make a booking'
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    let session;
    try {
      session = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch (error) {
      serverLogger.apiError('bookings', 'Failed to parse session cookie', { error });
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid session',
          details: 'Please sign in again'
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (!session?.user?.id || !session?.isAuthenticated) {
      serverLogger.apiWarn('bookings', 'Invalid session data', { 
        hasUser: !!session?.user,
        hasId: !!session?.user?.id,
        isAuthenticated: !!session?.isAuthenticated
      });
      
      return new NextResponse(
        JSON.stringify({ 
          error: 'Unauthorized access',
          details: 'Invalid session data'
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const userId = session.user.id;
    const userRole = session.user.role;
    
    const bookingData = await request.json();

    // Double-check availability before creating booking
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        propertyId: bookingData.propertyId,
        status: {
          notIn: ['CANCELLED', 'REJECTED']
        },
        OR: [
          {
            AND: {
              startDate: { lte: new Date(bookingData.endDate) },
              endDate: { gte: new Date(bookingData.startDate) }
            }
          }
        ]
      }
    });

    if (overlappingBooking) {
      serverLogger.apiWarn('bookings', 'Property already booked for requested dates', { 
        propertyId: bookingData.propertyId,
        requestedDates: {
          start: bookingData.startDate,
          end: bookingData.endDate
        }
      });
      return new NextResponse(
        JSON.stringify({ 
          error: 'Property is no longer available for these dates'
        }),
        { 
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate booking reference if not provided
    const bookingRef = bookingData.clientBookingRef || `BK-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Filter to include only fields that exist in the Booking model
    // This helps prevent errors with fields not in the schema
    const validBookingData = {
      propertyId: bookingData.propertyId,
      customerId: userId,
      startDate: new Date(bookingData.startDate),
      endDate: new Date(bookingData.endDate),
      status: bookingData.status,
      price: parseFloat(bookingData.price),
      guests: parseInt(bookingData.guests, 10) || 1,
      bookingRef: bookingRef,
      subtotal: parseFloat(bookingData.subtotal || 0),
      cleaningFee: parseFloat(bookingData.cleaningFee || 0),
      serviceFee: parseFloat(bookingData.serviceFee || 0),
      securityDeposit: parseFloat(bookingData.securityDeposit || 0)
    };
    
    // Create the booking with validated data
    const booking = await prisma.booking.create({
      data: validBookingData
    });
    
    // Return the created booking data
    const bookingResponse = {
      ...booking
    };
    
    serverLogger.apiInfo('bookings', 'Booking created successfully', {
      bookingId: booking.id,
      userId,
      propertyId: bookingData.propertyId
    });

    return new NextResponse(
      JSON.stringify(bookingResponse),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    serverLogger.apiError('bookings', 'Error creating booking', {
      error: error.message,
      stack: error.stack,
    });
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to create booking',
        details: error.message
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 