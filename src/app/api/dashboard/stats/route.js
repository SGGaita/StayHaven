import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

export async function GET(request) {
  try {
    // Get user ID from session/token
    // For now, we'll use a placeholder until auth is fully implemented
    const userId = '123'; // Replace with actual user ID from session

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

    logger.info('dashboard', 'Dashboard stats fetched successfully', {
      userId,
      totalProperties,
      activeBookings,
      monthlyRevenue: monthlyRevenue._sum.price || 0,
      averageRating: ratings._avg.rating || 0,
    });

    return NextResponse.json({
      totalProperties,
      activeBookings,
      monthlyRevenue: monthlyRevenue._sum.price || 0,
      averageRating: ratings._avg.rating || 0,
    });
  } catch (error) {
    logger.error('dashboard', 'Error fetching dashboard stats', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { message: 'Error fetching dashboard statistics' },
      { status: 500 }
    );
  }
} 