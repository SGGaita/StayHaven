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
      serverLogger.apiWarn('property-approve', 'No session cookie found');
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
      serverLogger.apiError('property-approve', 'Failed to parse session cookie', { error });
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
      serverLogger.apiWarn('property-approve', 'Invalid session data');
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

    // Check if user is super admin
    if (userRole !== 'SUPER_ADMIN') {
      serverLogger.authError('property-approve', 'Non-super-admin access attempt', { 
        userId,
        role: userRole 
      });
      return new NextResponse(
        JSON.stringify({ 
          error: 'Unauthorized access',
          details: 'Super admin access required'
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { id } = params;

    serverLogger.adminInfo('property-approve', 'Approving property', { userId, propertyId: id });

    try {
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
        
        serverLogger.adminInfo('property-approve', 'Notification sent to property manager', {
          userId,
          propertyId: id,
          managerId: updatedProperty.manager.id
        });
      } catch (notificationError) {
        serverLogger.apiWarn('property-approve', 'Failed to create notification', { 
          error: notificationError.message,
          userId,
          propertyId: id
        });
        // Continue execution even if notification fails
      }

      serverLogger.adminInfo('property-approve', 'Property approved successfully', {
        userId,
        propertyId: id,
        propertyName: updatedProperty.name
      });

      return new NextResponse(
        JSON.stringify(updatedProperty),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (dbError) {
      serverLogger.apiError('property-approve', 'Database error during approval', {
        error: dbError.message,
        stack: dbError.stack,
        userId,
        propertyId: id
      });
      return new NextResponse(
        JSON.stringify({ 
          error: 'Database error',
          details: 'Failed to approve property'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    serverLogger.apiError('property-approve', 'Error in property approval', {
      error: error.message,
      stack: error.stack
    });
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        details: 'Failed to approve property'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 