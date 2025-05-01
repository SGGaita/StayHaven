import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import logger from '@/lib/server-logger';

export async function GET(request) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token) {
      logger.authError('admin-stats', 'No authentication token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (token.role !== 'SUPER_ADMIN') {
      logger.authError('admin-stats', 'Non-admin access attempt', { 
        userId: token.id,
        role: token.role 
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.adminDebug('stats-fetch', 'Fetching admin stats', { userId: token.id });

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

      logger.adminInfo('stats-fetch', 'Admin stats fetched successfully', {
        userId: token.id,
        ...stats
      });

      return NextResponse.json(stats);
    } catch (dbError) {
      logger.apiError('stats-fetch', 'Database error while fetching admin stats', {
        error: dbError.message,
        stack: dbError.stack,
      });
      return NextResponse.json(
        { error: 'Database Error' },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.apiError('stats-fetch', 'Error fetching admin stats', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 