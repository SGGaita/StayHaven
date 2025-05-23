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

    if (!['SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;

    // Update property status to ACTIVE
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        status: 'ACTIVE'
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Send notification (if you have a notification system)
    try {
      await prisma.notification.create({
        data: {
          userId: updatedProperty.manager.id,
          type: 'PROPERTY_APPROVED',
          title: 'Property Approved',
          message: `Your property "${updatedProperty.name}" has been approved and is now live.`,
          data: {
            propertyId: updatedProperty.id,
            propertyName: updatedProperty.name,
          },
        },
      });
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
      // Continue execution even if notification fails
    }

    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error('Error in property approval:', error);
    return NextResponse.json(
      { error: 'Failed to approve property' },
      { status: 500 }
    );
  }
} 