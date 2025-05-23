import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import serverLogger from '@/lib/server-logger';

export async function POST(request, { params }) {
  try {
    const { startDate, endDate } = await request.json();
    const propertyId = params.id;
    
    serverLogger.apiInfo('check-availability', 'Checking property availability', { 
      propertyId,
      startDate,
      endDate
    });

    // Convert string dates to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check for overlapping bookings
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        propertyId: propertyId,
        status: {
          notIn: ['CANCELLED', 'REJECTED']
        },
        OR: [
          {
            // New booking starts during an existing booking
            AND: {
              startDate: { lte: end },
              endDate: { gte: start }
            }
          },
          {
            // New booking ends during an existing booking
            AND: {
              startDate: { lte: end },
              endDate: { gte: start }
            }
          },
          {
            // New booking completely encompasses an existing booking
            AND: {
              startDate: { gte: start },
              endDate: { lte: end }
            }
          }
        ]
      }
    });

    if (overlappingBooking) {
      serverLogger.apiInfo('check-availability', 'Property not available for requested dates', {
        propertyId,
        requestedDates: { start: startDate, end: endDate },
        overlappingBooking: {
          startDate: overlappingBooking.startDate,
          endDate: overlappingBooking.endDate
        }
      });
      
      return NextResponse.json({
        available: false,
        existingBooking: {
          startDate: overlappingBooking.startDate,
          endDate: overlappingBooking.endDate
        }
      });
    }
    
    serverLogger.apiInfo('check-availability', 'Property available for requested dates', {
      propertyId,
      requestedDates: { start: startDate, end: endDate }
    });

    return NextResponse.json({ available: true });
  } catch (error) {
    serverLogger.apiError('check-availability', 'Error checking availability', {
      error: error.message,
      propertyId: params.id,
      stack: error.stack
    });
    
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
} 