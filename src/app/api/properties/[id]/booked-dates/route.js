import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import serverLogger from '@/lib/server-logger';

export async function GET(request, { params }) {
  try {
    const propertyId = params.id;
    
    serverLogger.apiInfo('booked-dates', 'Fetching booked dates', { propertyId });

    // Get all active bookings for the property
    const bookings = await prisma.booking.findMany({
      where: {
        propertyId: propertyId,
        status: {
          notIn: ['CANCELLED', 'REJECTED']
        },
        // Only get bookings from today onwards
        startDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      select: {
        startDate: true,
        endDate: true
      }
    });

    return NextResponse.json({
      bookedDates: bookings.map(booking => ({
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString()
      }))
    });
  } catch (error) {
    serverLogger.apiError('booked-dates', 'Error fetching booked dates', {
      error: error.message,
      propertyId: params.id,
      stack: error.stack,
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch booked dates' },
      { status: 500 }
    );
  }
} 