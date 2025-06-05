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

    serverLogger.apiInfo('dashboard', 'Fetching dashboard stats', { userId, userRole });

    // Default stats object
    const defaultStats = {
      totalProperties: 0,
      activeBookings: 0,
      monthlyRevenue: 0,
      averageRating: 0
    };

    try {
      let stats = { ...defaultStats };

      if (userRole === 'CUSTOMER') {
        // Get active bookings for customer
        const activeBookings = await prisma.booking.count({
          where: {
            customerId: userId,
            status: 'CONFIRMED',
            endDate: {
              gte: new Date(),
            },
          },
        });

        // Calculate total spent
        const totalSpent = await prisma.booking.aggregate({
          where: {
            customerId: userId,
            status: 'CONFIRMED',
          },
          _sum: {
            price: true,
          },
        });

        // Temporarily set favorites count to 0 since the model doesn't exist yet
        const favoriteProperties = 0;

        // Get reviews given count
        const reviewsGiven = await prisma.review.count({
          where: {
            customerId: userId,
          },
        });

        stats = {
          totalProperties: favoriteProperties || 0,
          activeBookings: activeBookings || 0,
          monthlyRevenue: totalSpent._sum?.price || 0,
          averageRating: reviewsGiven || 0,
        };
      } else {
        // Property manager stats
        const [
          totalProperties,
          activeBookings,
          monthlyRevenue,
          ratings
        ] = await Promise.all([
          prisma.property.count({
            where: { managerId: userId },
          }),
          prisma.booking.count({
            where: {
              property: { managerId: userId },
              status: 'CONFIRMED',
              endDate: { gte: new Date() },
            },
          }),
          prisma.booking.aggregate({
            where: {
              property: { managerId: userId },
              status: 'CONFIRMED',
              startDate: { gte: new Date(new Date().setDate(1)) },
            },
            _sum: { price: true },
          }),
          prisma.review.aggregate({
            where: {
              property: { managerId: userId },
            },
            _avg: { rating: true },
          }),
        ]);

        stats = {
          totalProperties: totalProperties || 0,
          activeBookings: activeBookings || 0,
          monthlyRevenue: monthlyRevenue._sum?.price || 0,
          averageRating: ratings._avg?.rating || 0,
        };
      }

      serverLogger.apiInfo('dashboard', 'Stats fetched successfully', { userId, userRole, stats });

      return new NextResponse(
        JSON.stringify(stats),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (dbError) {
      serverLogger.apiError('dashboard', 'Database error', {
        error: dbError.message,
        stack: dbError.stack,
        userId,
        userRole,
      });

      return new NextResponse(
        JSON.stringify({ 
          error: 'Database error',
          stats: defaultStats
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    serverLogger.apiError('dashboard', 'Unexpected error', {
      error: error.message,
      stack: error.stack,
    });

    const defaultStats = {
      totalProperties: 0,
      activeBookings: 0,
      monthlyRevenue: 0,
      averageRating: 0
    };

    return new NextResponse(
      JSON.stringify({ 
        error: 'An unexpected error occurred',
        stats: defaultStats
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 