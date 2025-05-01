import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

export async function GET(request) {
  try {
    const token = await getToken({ req: request });
    if (!token || token.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('admin', 'Fetching recent activities', { userId: token.id });

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
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

    logger.info('admin', 'Recent activities fetched successfully', {
      userId: token.id,
      activityCount: activities.length,
    });

    return NextResponse.json(activities);
  } catch (error) {
    logger.error('admin', 'Error fetching recent activities', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 