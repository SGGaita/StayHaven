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
    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    // Update booking status to REJECTED
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectedBy: session.user.id,
        rejectionReason: reason,
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
        type: 'BOOKING_REJECTED',
        title: 'Booking Rejected',
        message: `Your booking for "${updatedBooking.property.title}" has been rejected. Reason: ${reason}`,
        data: {
          bookingId: updatedBooking.id,
          propertyId: updatedBooking.property.id,
          propertyTitle: updatedBooking.property.title,
          rejectionReason: reason,
        },
      },
    });

    // Create notification for property owner
    await prisma.notification.create({
      data: {
        userId: updatedBooking.property.owner.id,
        type: 'BOOKING_REJECTED',
        title: 'Booking Rejected',
        message: `A booking for "${updatedBooking.property.title}" has been rejected. Reason: ${reason}`,
        data: {
          bookingId: updatedBooking.id,
          propertyId: updatedBooking.property.id,
          propertyTitle: updatedBooking.property.title,
          guestName: updatedBooking.guest.name,
          rejectionReason: reason,
        },
      },
    });

    // Send email notifications (implement email service integration)
    // await sendBookingRejectionEmail(updatedBooking.guest.email, updatedBooking, reason);
    // await sendHostBookingRejectionEmail(updatedBooking.property.owner.email, updatedBooking, reason);

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error in booking rejection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 