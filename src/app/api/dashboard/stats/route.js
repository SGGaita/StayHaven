import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    // Get user from session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    logger.info('dashboard', 'Fetching dashboard stats', { userId });

    // Get total properties
    const totalProperties = await prisma.property.count({
      where: {
        managerId: userId,
      },
    });

    // Get active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        property: {
          managerId: userId,
        },
        status: 'CONFIRMED',
        endDate: {
          gte: new Date(),
        },
      },
    });

    // Calculate monthly revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await prisma.booking.aggregate({
      where: {
        property: {
          managerId: userId,
        },
        status: 'CONFIRMED',
        startDate: {
          gte: startOfMonth,
        },
      },
      _sum: {
        price: true,
      },
    });

    // Calculate average rating
    const ratings = await prisma.review.aggregate({
      where: {
        property: {
          managerId: userId,
        },
      },
      _avg: {
        rating: true,
      },
    });

    const stats = {
      totalProperties,
      activeBookings,
      monthlyRevenue: monthlyRevenue._sum.price || 0,
      averageRating: ratings._avg.rating || 0,
    };

    logger.info('dashboard', 'Dashboard stats fetched successfully', {
      userId,
      ...stats,
    });

    return NextResponse.json(stats);
  } catch (error) {
    logger.error('dashboard', 'Error fetching dashboard stats', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: 'Error fetching dashboard statistics' },
      { status: 500 }
    );
  }
} 