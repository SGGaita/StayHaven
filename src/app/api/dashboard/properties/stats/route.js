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
      serverLogger.warn('[API][dashboard/properties/stats] No session cookie found');
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
      serverLogger.error('[API][dashboard/properties/stats] Failed to parse session cookie', { error });
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
      serverLogger.warn('[API][dashboard/properties/stats] Invalid session data', { 
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

    serverLogger.info('[API][dashboard/properties/stats] Fetching property stats', {
      userId,
      userRole,
    });

    // Build where clause based on user role
    let whereClause = {};
    
    if (userRole === 'PROPERTY_MANAGER') {
      whereClause = { managerId: userId };
    } else if (userRole === 'SUPER_ADMIN') {
      whereClause = {};
    } else {
      whereClause = { status: 'ACTIVE' };
    }

    try {
      // Get current date and month boundaries
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      // Get property counts
      const [totalProperties, activeProperties, inactiveProperties] = await Promise.all([
        prisma.property.count({ where: whereClause }),
        prisma.property.count({ where: { ...whereClause, status: 'ACTIVE' } }),
        prisma.property.count({ where: { ...whereClause, status: { not: 'ACTIVE' } } }),
      ]);

      // Build booking where clause
      let bookingWhereClause = {};
      if (userRole === 'PROPERTY_MANAGER') {
        bookingWhereClause = {
          property: { managerId: userId }
        };
      } else if (userRole === 'SUPER_ADMIN') {
        bookingWhereClause = {};
      } else {
        bookingWhereClause = {
          property: { status: 'ACTIVE' }
        };
      }

      // Calculate monthly revenue from confirmed bookings this month
      const monthlyBookings = await prisma.booking.findMany({
        where: {
          ...bookingWhereClause,
          status: { in: ['CONFIRMED', 'COMPLETED'] },
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        select: {
          price: true,
          subtotal: true,
          cleaningFee: true,
          serviceFee: true,
        }
      });

      const monthlyRevenue = monthlyBookings.reduce((total, booking) => {
        // Use subtotal + fees if available, otherwise use price
        const bookingTotal = booking.subtotal 
          ? booking.subtotal + (booking.cleaningFee || 0) + (booking.serviceFee || 0)
          : booking.price;
        return total + bookingTotal;
      }, 0);

      // Calculate total revenue for the year
      const yearlyBookings = await prisma.booking.findMany({
        where: {
          ...bookingWhereClause,
          status: { in: ['CONFIRMED', 'COMPLETED'] },
          createdAt: {
            gte: startOfYear,
            lte: now
          }
        },
        select: {
          price: true,
          subtotal: true,
          cleaningFee: true,
          serviceFee: true,
        }
      });

      const yearlyRevenue = yearlyBookings.reduce((total, booking) => {
        const bookingTotal = booking.subtotal 
          ? booking.subtotal + (booking.cleaningFee || 0) + (booking.serviceFee || 0)
          : booking.price;
        return total + bookingTotal;
      }, 0);

      // Calculate occupancy rate
      // Get all bookings for this month to calculate occupancy
      const monthlyBookingsForOccupancy = await prisma.booking.findMany({
        where: {
          ...bookingWhereClause,
          status: { in: ['CONFIRMED', 'COMPLETED'] },
          OR: [
            {
              startDate: {
                gte: startOfMonth,
                lte: endOfMonth
              }
            },
            {
              endDate: {
                gte: startOfMonth,
                lte: endOfMonth
              }
            },
            {
              AND: [
                { startDate: { lte: startOfMonth } },
                { endDate: { gte: endOfMonth } }
              ]
            }
          ]
        },
        select: {
          startDate: true,
          endDate: true,
          propertyId: true,
        }
      });

      // Calculate total booked nights
      let totalBookedNights = 0;
      monthlyBookingsForOccupancy.forEach(booking => {
        const start = booking.startDate < startOfMonth ? startOfMonth : booking.startDate;
        const end = booking.endDate > endOfMonth ? endOfMonth : booking.endDate;
        const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        totalBookedNights += Math.max(0, nights);
      });

      // Calculate total available nights (properties * days in month)
      const daysInMonth = endOfMonth.getDate();
      const totalAvailableNights = totalProperties * daysInMonth;
      
      const averageOccupancy = totalAvailableNights > 0 
        ? Math.round((totalBookedNights / totalAvailableNights) * 100) 
        : 0;

      // Get total bookings count
      const totalBookings = await prisma.booking.count({
        where: bookingWhereClause
      });

      // Get average rating
      const reviews = await prisma.review.findMany({
        where: {
          property: userRole === 'PROPERTY_MANAGER' 
            ? { managerId: userId }
            : userRole === 'SUPER_ADMIN' 
              ? {}
              : { status: 'ACTIVE' }
        },
        select: {
          rating: true
        }
      });

      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

      const stats = {
        totalProperties,
        activeProperties,
        inactiveProperties,
        monthlyRevenue: Math.round(monthlyRevenue),
        yearlyRevenue: Math.round(yearlyRevenue),
        averageOccupancy,
        totalBookings,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        totalReviews: reviews.length,
      };

      serverLogger.info('[API][dashboard/properties/stats] Stats calculated successfully', {
        userId,
        userRole,
        stats,
        calculations: {
          monthlyBookingsCount: monthlyBookings.length,
          totalBookedNights,
          totalAvailableNights,
          daysInMonth
        }
      });

      return NextResponse.json({
        success: true,
        stats,
      });
    } catch (dbError) {
      // Return basic stats if database query fails
      const mockStats = {
        totalProperties: 0,
        activeProperties: 0,
        inactiveProperties: 0,
        monthlyRevenue: 0,
        yearlyRevenue: 0,
        averageOccupancy: 0,
        totalBookings: 0,
        averageRating: 0,
        totalReviews: 0,
      };

      serverLogger.warn('[API][dashboard/properties/stats] Database error, returning basic stats', {
        userId,
        userRole,
        error: dbError.message,
      });

      return NextResponse.json({
        success: true,
        stats: mockStats,
        error: 'Database temporarily unavailable'
      });
    }
  } catch (error) {
    serverLogger.error('[API][dashboard/properties/stats] Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property statistics' },
      { status: 500 }
    );
  }
} 