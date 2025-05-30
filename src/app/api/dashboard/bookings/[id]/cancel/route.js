import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import serverLogger from '@/lib/server-logger';

export async function POST(req, { params }) {
  try {
    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('auth');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    let session;
    try {
      session = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }
    
    if (!session?.user?.id || !session?.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { id: bookingId } = params;
    const { reason } = await req.json();

    serverLogger.apiInfo('booking-cancel', 'Processing booking cancellation', {
      userId,
      bookingId,
      reason,
    });

    // Get the booking with property details
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        customerId: userId,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            managerId: true,
          },
        },
      },
    });

    if (!existingBooking) {
      serverLogger.apiWarn('booking-cancel', 'Booking not found or unauthorized', {
        userId,
        bookingId,
      });
      return NextResponse.json(
        { error: 'Booking not found or you do not have permission to cancel it' },
        { status: 404 }
      );
    }

    // Check if booking can be cancelled
    if (!['PENDING', 'CONFIRMED'].includes(existingBooking.status)) {
      serverLogger.apiWarn('booking-cancel', 'Booking cannot be cancelled', {
        userId,
        bookingId,
        currentStatus: existingBooking.status,
      });
      return NextResponse.json(
        { error: 'This booking cannot be cancelled' },
        { status: 400 }
      );
    }

    // Check if cancellation is within allowed timeframe (e.g., 24 hours before check-in)
    const checkInDate = new Date(existingBooking.startDate);
    const now = new Date();
    const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);

    if (hoursUntilCheckIn < 24) {
      serverLogger.apiWarn('booking-cancel', 'Cancellation too close to check-in', {
        userId,
        bookingId,
        hoursUntilCheckIn,
      });
      return NextResponse.json(
        { error: 'Bookings cannot be cancelled within 24 hours of check-in' },
        { status: 400 }
      );
    }

    try {
      // Update booking status to CANCELLED
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
      data: {
        status: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason: reason,
      },
      include: {
        property: {
              select: {
                id: true,
              name: true,
              managerId: true,
            },
          },
        },
      });

      // Create notification for property manager
      try {
        await prisma.notification.create({
          data: {
            userId: existingBooking.property.managerId,
            type: 'BOOKING_CANCELLED',
            title: 'Booking Cancelled',
            message: `A booking for "${existingBooking.property.name}" has been cancelled by the customer.`,
            data: {
              bookingId: updatedBooking.id,
              propertyId: updatedBooking.propertyId,
              propertyName: existingBooking.property.name,
              customerName: `${session.user.firstName} ${session.user.lastName}`,
              cancellationReason: reason,
              refundAmount: updatedBooking.price,
            },
          },
        });
      } catch (notificationError) {
        serverLogger.apiWarn('booking-cancel', 'Failed to create notification', { 
          error: notificationError.message,
          bookingId,
          userId
        });
        // Continue execution even if notification fails
      }

      // Create notification for customer (confirmation)
      try {
        await prisma.notification.create({
          data: {
            userId: userId,
            type: 'BOOKING_CANCELLED',
            title: 'Booking Cancelled Successfully',
            message: `Your booking for "${existingBooking.property.name}" has been cancelled. A refund will be processed within 3-5 business days.`,
            data: {
              bookingId: updatedBooking.id,
              propertyId: updatedBooking.propertyId,
              propertyName: existingBooking.property.name,
              refundAmount: updatedBooking.price,
            },
          },
        });
      } catch (notificationError) {
        serverLogger.apiWarn('booking-cancel', 'Failed to create customer notification', { 
          error: notificationError.message,
          bookingId,
          userId
        });
      }

      serverLogger.apiInfo('booking-cancel', 'Booking cancelled successfully', {
        userId,
        bookingId,
        propertyName: existingBooking.property.name,
    });

      return NextResponse.json({
        success: true,
        booking: updatedBooking,
        message: 'Booking cancelled successfully. A refund will be processed within 3-5 business days.',
      });

    } catch (dbError) {
      serverLogger.apiError('booking-cancel', 'Database error during cancellation', {
        error: dbError.message,
        stack: dbError.stack,
        userId,
        bookingId
      });
      
      return NextResponse.json(
        { error: 'Cancellation processing failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    serverLogger.apiError('booking-cancel', 'Unexpected error in booking cancellation', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 