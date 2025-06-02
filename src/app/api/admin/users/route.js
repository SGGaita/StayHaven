import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import logger from '@/lib/server-logger';
import { cookies } from 'next/headers';

// GET handler for fetching users
export async function GET(request) {
  try {
    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('auth');

    if (!sessionCookie) {
      logger.authError('admin-users-access', 'No session cookie found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch (error) {
      logger.authError('admin-users-access', 'Failed to parse session cookie', { error });
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    if (!session?.user?.id || !session?.user?.role || !session.isAuthenticated) {
      logger.authError('admin-users-access', 'Invalid session data', { 
        hasUser: !!session?.user,
        hasId: !!session?.user?.id,
        hasRole: !!session?.user?.role,
        isAuthenticated: !!session?.isAuthenticated
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      logger.authError('unauthorized-access', 'Non-admin access attempt', { 
        userId: session.user.id,
        role: session.user.role 
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';

    logger.apiDebug('admin-users-list', 'Fetching users with params', {
      page,
      limit,
      search,
      adminId: session.user.id
    });

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Prepare search conditions
    const searchCondition = search ? {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    } : {};

    // Get users with pagination and search
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: searchCondition,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          verificationStatus: true,
          createdAt: true,
          updatedAt: true,
          profileInfo: true,
          _count: {
            select: {
              properties: true,
              bookings: true,
              reviews: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({
        where: searchCondition,
      }),
    ]);

    logger.adminInfo('users-fetched', 'Users fetched successfully', {
      adminId: session.user.id,
      totalUsers: total,
      fetchedUsers: users.length,
      page,
      limit,
      searchQuery: search,
    });

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.apiError('admin-users-list', 'Failed to fetch users', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST handler for creating a new user
export async function POST(request) {
  try {
    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('auth');

    if (!sessionCookie) {
      logger.authError('admin-user-create', 'No session cookie found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch (error) {
      logger.authError('admin-user-create', 'Failed to parse session cookie', { error });
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    if (!session?.user?.id || !session?.user?.role || !session.isAuthenticated) {
      logger.authError('admin-user-create', 'Invalid session data');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      logger.authError('unauthorized-access', 'Unauthorized user creation attempt', {
        userId: session.user.id,
        role: session.user.role
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    logger.apiDebug('admin-user-create', 'Creating new user', {
      adminId: session.user.id,
      userData: { ...data, password: undefined }
    });

    const user = await prisma.user.create({
      data: {
        ...data,
        password: await bcrypt.hash(data.password, 10),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        verificationStatus: true,
        createdAt: true,
      },
    });

    logger.adminInfo('user-created', 'New user created successfully', {
      adminId: session.user.id,
      newUserId: user.id,
      userRole: user.role
    });

    return NextResponse.json(user);
  } catch (error) {
    logger.apiError('admin-user-create', 'Failed to create user', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH handler for updating a user
export async function PATCH(request) {
  try {
    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('auth');

    if (!sessionCookie) {
      logger.authError('admin-user-update', 'No session cookie found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch (error) {
      logger.authError('admin-user-update', 'Failed to parse session cookie', { error });
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    if (!session?.user?.id || !session?.user?.role || !session.isAuthenticated) {
      logger.authError('admin-user-update', 'Invalid session data');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      logger.authError('unauthorized-access', 'Unauthorized user update attempt', {
        userId: session.user.id,
        role: session.user.role
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    logger.apiDebug('admin-user-update', 'Updating user', {
      adminId: session.user.id,
      targetUserId: id,
      updateFields: Object.keys(updateData)
    });

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        verificationStatus: true,
        updatedAt: true,
      },
    });

    logger.adminInfo('user-updated', 'User updated successfully', {
      adminId: session.user.id,
      updatedUserId: user.id,
      updateFields: Object.keys(updateData)
    });

    return NextResponse.json(user);
  } catch (error) {
    logger.apiError('admin-user-update', 'Failed to update user', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting a user
export async function DELETE(request) {
  try {
    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('auth');

    if (!sessionCookie) {
      logger.authError('admin-user-delete', 'No session cookie found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch (error) {
      logger.authError('admin-user-delete', 'Failed to parse session cookie', { error });
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    if (!session?.user?.id || !session?.user?.role || !session.isAuthenticated) {
      logger.authError('admin-user-delete', 'Invalid session data');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      logger.authError('unauthorized-access', 'Unauthorized user deletion attempt', {
        userId: session.user.id,
        role: session.user.role
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    logger.apiDebug('admin-user-delete', 'Deleting user', {
      adminId: session.user.id,
      targetUserId: userId
    });

    await prisma.user.delete({
      where: { id: userId },
    });

    logger.adminInfo('user-deleted', 'User deleted successfully', {
      adminId: session.user.id,
      deletedUserId: userId
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.apiError('admin-user-delete', 'Failed to delete user', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 