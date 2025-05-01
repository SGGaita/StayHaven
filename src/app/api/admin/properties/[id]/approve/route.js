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

    // Update property status to ACTIVE
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        approvedAt: new Date(),
        approvedBy: session.user.id,
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
        type: 'PROPERTY_APPROVED',
        title: 'Property Approved',
        message: `Your property "${updatedProperty.title}" has been approved and is now live.`,
        data: {
          propertyId: updatedProperty.id,
          propertyTitle: updatedProperty.title,
        },
      },
    });

    // Send email notification (implement email service integration)
    // await sendPropertyApprovalEmail(updatedProperty.owner.email, updatedProperty);

    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error('Error in property approval:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 