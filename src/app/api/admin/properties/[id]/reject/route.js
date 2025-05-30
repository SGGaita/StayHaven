import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import serverLogger from '@/lib/server-logger';
import { cookies } from 'next/headers';

export async function POST(request, { params }) {
  try {
    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('auth');

    if (!sessionCookie) {
      serverLogger.apiWarn('property-reject', 'No session cookie found');
      return new NextResponse(
        JSON.stringify({ 
          error: 'Unauthorized access',
          details: 'Please sign in to access this resource'
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
      serverLogger.apiError('property-reject', 'Failed to parse session cookie', { error });
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

    if (!session?.user?.id || !session?.user?.role || !session.isAuthenticated) {
      serverLogger.apiWarn('property-reject', 'Invalid session data');
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

    // Check if user is admin or super admin
    if (!['SUPER_ADMIN', 'ADMIN'].includes(userRole)) {
      serverLogger.authError('property-reject', 'Non-admin access attempt', { 
        userId,
        role: userRole 
      });
      return new NextResponse(
        JSON.stringify({ 
          error: 'Unauthorized access',
          details: 'Admin access required'
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Rejection reason is required'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    serverLogger.adminInfo('property-reject', 'Rejecting property', { 
      userId, 
      propertyId: id, 
      reason 
    });

    try {
      // Update property status to REJECTED
      const updatedProperty = await prisma.property.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectedAt: new Date(),
          rejectedBy: userId,
          rejectionReason: reason,
        },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Create notification for property manager
      try {
        await prisma.notification.create({
          data: {
            userId: updatedProperty.manager.id,
            type: 'PROPERTY_REJECTED',
            title: 'Property Rejected',
            message: `Your property "${updatedProperty.name}" has been rejected. Reason: ${reason}`,
            data: {
              propertyId: updatedProperty.id,
              propertyName: updatedProperty.name,
              rejectionReason: reason,
            },
          },
        });

        serverLogger.adminInfo('property-reject', 'Notification sent to property manager', {
          userId,
          propertyId: id,
          managerId: updatedProperty.manager.id
        });
      } catch (notificationError) {
        serverLogger.apiWarn('property-reject', 'Failed to create notification', { 
          error: notificationError.message,
          userId,
          propertyId: id
        });
        // Continue execution even if notification fails
      }

      // Send email notification (implement email service integration)
      // await sendPropertyRejectionEmail(updatedProperty.manager.email, updatedProperty, reason);

      serverLogger.adminInfo('property-reject', 'Property rejected successfully', {
        userId,
        propertyId: id,
        propertyName: updatedProperty.name,
        reason
      });

      return new NextResponse(
        JSON.stringify(updatedProperty),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (dbError) {
      serverLogger.apiError('property-reject', 'Database error during rejection', {
        error: dbError.message,
        stack: dbError.stack,
        userId,
        propertyId: id
      });
      return new NextResponse(
        JSON.stringify({ 
          error: 'Database error',
          details: 'Failed to reject property'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    serverLogger.apiError('property-reject', 'Error in property rejection', {
      error: error.message,
      stack: error.stack
    });
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        details: 'Failed to reject property'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 