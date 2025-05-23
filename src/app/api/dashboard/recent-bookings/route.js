import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import serverLogger from '@/lib/server-logger';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('auth');

    if (!sessionCookie) {
      serverLogger.apiWarn('dashboard', 'No session cookie found');
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
      serverLogger.apiError('dashboard', 'Failed to parse session cookie', { error });
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
      serverLogger.apiWarn('dashboard', 'Invalid session data', { 
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

    serverLogger.apiInfo('dashboard', 'Fetching recent bookings', { userId, userRole });

    let recentBookings = [];
    
    try {
      if (userRole === 'CUSTOMER') {
        // For customers, get their bookings
        recentBookings = await prisma.booking.findMany({
          where: {
            customerId: userId,
          },
          include: {
            property: {
              select: {
                name: true,
                photos: true,
              },
            },
            customer: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // Limit to 5 most recent bookings
        });
      } else {
        // For property managers or admins, get bookings for their properties
        recentBookings = await prisma.booking.findMany({
          where: {
            property: {
              managerId: userId,
            },
          },
          include: {
            property: {
              select: {
                name: true,
                photos: true,
              },
            },
            customer: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // Limit to 5 most recent bookings
        });
      }

      serverLogger.apiInfo('dashboard', 'Recent bookings fetched successfully', {
        userId,
        userRole,
        bookingCount: recentBookings.length,
      });

      return new NextResponse(
        JSON.stringify(recentBookings),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (dbError) {
      serverLogger.apiError('dashboard', 'Database error fetching bookings', {
        error: dbError.message,
        stack: dbError.stack,
        userId,
        userRole,
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
    serverLogger.apiError('dashboard', 'Unexpected error in recent-bookings', {
      error: error.message,
      stack: error.stack,
    });

    return new NextResponse(
      JSON.stringify({ 
        error: 'An unexpected error occurred',
        details: error.message
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 