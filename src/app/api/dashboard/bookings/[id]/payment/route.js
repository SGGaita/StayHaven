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
    const bookingId = params.id;
    const body = await req.json();
    const { paymentMethod, amount } = body;

    serverLogger.apiInfo('payment', 'Processing payment for booking', {
      userId,
      bookingId,
      paymentMethod,
      amount
    });

    // Verify the booking belongs to the user and is in PENDING status
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        customerId: userId,
        status: 'PENDING'
      },
      include: {
        property: {
          select: {
            name: true,
            managerId: true
          }
        }
      }
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found or not eligible for payment' },
        { status: 404 }
      );
    }

    // Validate payment amount matches booking price
    if (amount !== existingBooking.price) {
      return NextResponse.json(
        { error: 'Payment amount does not match booking price' },
        { status: 400 }
      );
    }

    // TODO: Integrate with actual payment processor (Stripe, PayPal, etc.)
    // For now, we'll simulate a successful payment
    
    // Generate a mock transaction ID
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    try {
      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          bookingId: bookingId,
          amount: amount,
          method: paymentMethod,
          status: 'COMPLETED',
          transactionId: transactionId,
        }
      });

      // Update booking status to CONFIRMED
      const updatedBooking = await prisma.booking.update({
        where: {
          id: bookingId
        },
        data: {
          status: 'CONFIRMED',
          updatedAt: new Date()
        },
        include: {
          property: {
            include: {
              manager: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                }
              }
            }
          },
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          payments: true
        }
      });

      // Create notification for property manager
      try {
        await prisma.notification.create({
          data: {
            userId: existingBooking.property.managerId,
            type: 'BOOKING_CONFIRMED',
            title: 'New Booking Confirmed',
            message: `A booking for "${existingBooking.property.name}" has been confirmed with payment.`,
            data: {
              bookingId: updatedBooking.id,
              propertyId: updatedBooking.propertyId,
              propertyName: existingBooking.property.name,
              customerName: `${session.user.firstName} ${session.user.lastName}`,
              amount: amount,
              transactionId: transactionId,
            },
          },
        });
      } catch (notificationError) {
        serverLogger.apiWarn('payment', 'Failed to create notification', { 
          error: notificationError.message,
          bookingId,
          userId
        });
        // Continue execution even if notification fails
      }

      serverLogger.apiInfo('payment', 'Payment processed successfully', {
        userId,
        bookingId,
        transactionId,
        amount
      });

      return NextResponse.json({
        success: true,
        booking: updatedBooking,
        payment: payment,
        transactionId: transactionId
      });

    } catch (dbError) {
      serverLogger.apiError('payment', 'Database error during payment processing', {
        error: dbError.message,
        stack: dbError.stack,
        userId,
        bookingId
      });
      
      return NextResponse.json(
        { error: 'Payment processing failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    serverLogger.apiError('payment', 'Error processing payment', {
      error: error.message,
      stack: error.stack,
      bookingId: params.id
    });
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 