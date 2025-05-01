import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

export async function GET(request) {
  try {
    // Get user ID from session/token
    // For now, we'll use a placeholder until auth is fully implemented
    const userId = '123'; // Replace with actual user ID from session

    logger.info('dashboard', 'Fetching recent bookings', { userId });

    const recentBookings = await prisma.booking.findMany({
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

    logger.info('dashboard', 'Recent bookings fetched successfully', {
      userId,
      bookingCount: recentBookings.length,
    });

    return NextResponse.json(recentBookings);
  } catch (error) {
    logger.error('dashboard', 'Error fetching recent bookings', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { message: 'Error fetching recent bookings' },
      { status: 500 }
    );
  }
} 