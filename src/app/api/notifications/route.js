import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import serverLogger from '@/lib/server-logger';

export async function GET(request) {
  try {
    // Check if prisma is properly initialized
    if (!prisma) {
      serverLogger.apiError('notifications', 'Prisma client not initialized');
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // Check if notification model exists
    if (!prisma.notification) {
      serverLogger.apiError('notifications', 'Notification model not found in Prisma client');
      return NextResponse.json(
        { 
          notifications: [],
          unreadCount: 0,
          error: 'Notification system not available'
        },
        { status: 200 }
      );
    }

    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('auth');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    let session;
    try {
      session = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }
    
    if (!session?.user?.id || !session?.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit')) || 10;

    serverLogger.apiInfo('notifications', 'Fetching user notifications', { 
      userId, 
      unreadOnly, 
      limit 
    });

    // Build where clause
    const where = {
      userId: userId,
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: userId,
        isRead: false,
      },
    });

    serverLogger.apiInfo('notifications', 'Notifications fetched successfully', {
      userId,
      notificationCount: notifications.length,
      unreadCount,
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    serverLogger.apiError('notifications', 'Error fetching notifications', {
      error: error.message,
      stack: error.stack,
    });

    // Return empty notifications instead of error to prevent UI breaking
    return NextResponse.json({
      notifications: [],
      unreadCount: 0,
      error: 'Failed to load notifications'
    });
  }
}

export async function PUT(request) {
  try {
    // Check if prisma is properly initialized
    if (!prisma || !prisma.notification) {
      serverLogger.apiError('notifications', 'Prisma client or notification model not available');
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('auth');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    let session;
    try {
      session = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }
    
    if (!session?.user?.id || !session?.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { notificationId, markAllAsRead } = await request.json();

    serverLogger.apiInfo('notifications', 'Marking notifications as read', { 
      userId, 
      notificationId, 
      markAllAsRead 
    });

    if (markAllAsRead) {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: {
          userId: userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      serverLogger.apiInfo('notifications', 'All notifications marked as read', { userId });
    } else if (notificationId) {
      // Mark specific notification as read
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId: userId,
        },
        data: {
          isRead: true,
        },
      });

      serverLogger.apiInfo('notifications', 'Notification marked as read', { 
        userId, 
        notificationId 
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    serverLogger.apiError('notifications', 'Error updating notifications', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 