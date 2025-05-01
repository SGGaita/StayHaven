import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;

    // Update booking status to CONFIRMED
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        confirmedBy: session.user.id,
      },
      include: {
        guest: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Create notification for guest
    await prisma.notification.create({
      data: {
        userId: updatedBooking.guest.id,
        type: 'BOOKING_CONFIRMED',
        title: 'Booking Confirmed',
        message: `Your booking for "${updatedBooking.property.title}" has been confirmed.`,
        data: {
          bookingId: updatedBooking.id,
          propertyId: updatedBooking.property.id,
          propertyTitle: updatedBooking.property.title,
        },
      },
    });

    // Create notification for property owner
    await prisma.notification.create({
      data: {
        userId: updatedBooking.property.owner.id,
        type: 'BOOKING_CONFIRMED',
        title: 'New Booking Confirmed',
        message: `A booking for "${updatedBooking.property.title}" has been confirmed.`,
        data: {
          bookingId: updatedBooking.id,
          propertyId: updatedBooking.property.id,
          propertyTitle: updatedBooking.property.title,
          guestName: updatedBooking.guest.name,
        },
      },
    });

    // Send email notifications (implement email service integration)
    // await sendBookingConfirmationEmail(updatedBooking.guest.email, updatedBooking);
    // await sendHostBookingNotificationEmail(updatedBooking.property.owner.email, updatedBooking);

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error in booking approval:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 