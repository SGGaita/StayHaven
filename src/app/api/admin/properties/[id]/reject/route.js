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

    // Update property status to REJECTED
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectedBy: session.user.id,
        rejectionReason: reason,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create notification for property owner
    await prisma.notification.create({
      data: {
        userId: updatedProperty.owner.id,
        type: 'PROPERTY_REJECTED',
        title: 'Property Rejected',
        message: `Your property "${updatedProperty.title}" has been rejected. Reason: ${reason}`,
        data: {
          propertyId: updatedProperty.id,
          propertyTitle: updatedProperty.title,
          rejectionReason: reason,
        },
      },
    });

    // Send email notification (implement email service integration)
    // await sendPropertyRejectionEmail(updatedProperty.owner.email, updatedProperty, reason);

    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error('Error in property rejection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 