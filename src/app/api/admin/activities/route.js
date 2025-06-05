import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import serverLogger from '@/lib/server-logger';
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('auth');

    if (!sessionCookie) {
      serverLogger.apiWarn('admin-activities', 'No session cookie found');
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
      serverLogger.apiError('admin-activities', 'Failed to parse session cookie', { error });
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
      serverLogger.apiWarn('admin-activities', 'Invalid session data', { 
        hasUser: !!session?.user,
        hasId: !!session?.user?.id,
        hasRole: !!session?.user?.role,
        isAuthenticated: !!session?.isAuthenticated
      });
      
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

    // Check if user is admin
    if (userRole !== 'SUPER_ADMIN') {
      serverLogger.authError('admin-activities', 'Non-admin access attempt', { 
        userId,
        role: userRole 
      });
      return new NextResponse(
        JSON.stringify({ 
          error: 'Unauthorized access',
          details: 'Admin access required'
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    serverLogger.adminInfo('activities-fetch', 'Fetching recent activities', { userId });

    try {
      // Get recent user registrations
      const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      // Get recent property listings
      const recentProperties = await prisma.property.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          location: true,
          status: true,
          createdAt: true,
          manager: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Get recent bookings
      const recentBookings = await prisma.booking.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          status: true,
          price: true,
          createdAt: true,
          property: {
            select: {
              name: true,
            },
          },
          customer: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Combine and sort all activities
      const activities = [
        ...recentUsers.map(user => ({
          type: 'USER_REGISTRATION',
          data: user,
          timestamp: user.createdAt,
        })),
        ...recentProperties.map(property => ({
          type: 'PROPERTY_LISTED',
          data: property,
          timestamp: property.createdAt,
        })),
        ...recentBookings.map(booking => ({
          type: 'BOOKING_CREATED',
          data: booking,
          timestamp: booking.createdAt,
        })),
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

      serverLogger.adminInfo('activities-fetch', 'Recent activities fetched successfully', {
        userId,
        activityCount: activities.length,
      });

      return new NextResponse(
        JSON.stringify({ activities }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (dbError) {
      serverLogger.apiError('activities-fetch', 'Database error while fetching activities', {
        error: dbError.message,
        stack: dbError.stack,
        userId
      });
      return new NextResponse(
        JSON.stringify({ 
          error: 'Database error',
          details: dbError.message
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    serverLogger.apiError('activities-fetch', 'Error fetching activities', {
      error: error.message,
      stack: error.stack,
    });
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        details: error.message
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 