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
      serverLogger.apiWarn('admin-stats', 'No session cookie found');
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
      serverLogger.apiError('admin-stats', 'Failed to parse session cookie', { error });
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
      serverLogger.apiWarn('admin-stats', 'Invalid session data', { 
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
      serverLogger.authError('admin-stats', 'Non-admin access attempt', { 
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

    serverLogger.adminInfo('stats-fetch', 'Fetching admin stats', { userId });

    try {
      // Get total users
      const totalUsers = await prisma.user.count();

      // Get total properties
      const totalProperties = await prisma.property.count();

      // Get total bookings
      const totalBookings = await prisma.booking.count({
        where: {
          status: 'CONFIRMED',
        },
      });

      // Calculate total revenue
      const revenue = await prisma.booking.aggregate({
        where: {
          status: 'CONFIRMED',
        },
        _sum: {
          price: true,
        },
      });

      // Get pending verifications
      const pendingVerifications = await prisma.property.count({
        where: {
          status: 'PENDING',
        },
      });

      // Get active users (users who have been active within the last 24 hours)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const activeUsers = await prisma.user.count({
        where: {
          updatedAt: {
            gte: twentyFourHoursAgo,
          },
        },
      });

      // Calculate system health (example metric)
      const systemHealth = 98; // This would be replaced with actual system health metrics

      const stats = {
        totalUsers,
        totalProperties,
        totalBookings,
        totalRevenue: revenue._sum.price || 0,
        pendingVerifications,
        activeUsers,
        systemHealth,
      };

      serverLogger.adminInfo('stats-fetch', 'Admin stats fetched successfully', {
        userId,
        ...stats
      });

      return new NextResponse(
        JSON.stringify(stats),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (dbError) {
      serverLogger.apiError('stats-fetch', 'Database error while fetching admin stats', {
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
    serverLogger.apiError('stats-fetch', 'Error fetching admin stats', {
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