import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import logger from '@/lib/server-logger';

// GET handler for fetching users
export async function GET(request) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    // Log the token status for debugging
    logger.authDebug('token-status', 'Authentication token status', {
      hasToken: !!token,
      tokenRole: token?.role,
      tokenId: token?.id,
    });

    if (!token) {
      logger.authError('admin-users-access', 'No authentication token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(token.role)) {
      logger.authError('unauthorized-access', 'Non-admin access attempt', { 
        userId: token.id,
        role: token.role 
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
      adminId: token.id || 'unknown'
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
      adminId: token.id || 'unknown',
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
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !['ADMIN', 'SUPER_ADMIN'].includes(token.role)) {
      logger.authError('unauthorized-access', 'Unauthorized user creation attempt', {
        userId: token?.id,
        role: token?.role
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    logger.apiDebug('admin-user-create', 'Creating new user', {
      adminId: token.id,
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
      adminId: token.id,
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
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !['ADMIN', 'SUPER_ADMIN'].includes(token.role)) {
      logger.authError('unauthorized-access', 'Unauthorized user update attempt', {
        userId: token?.id,
        role: token?.role
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    logger.apiDebug('admin-user-update', 'Updating user', {
      adminId: token.id,
      userId: id,
      updateData: { ...updateData, password: undefined }
    });

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
      adminId: token.id,
      userId: user.id,
      updatedFields: Object.keys(updateData)
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
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !['ADMIN', 'SUPER_ADMIN'].includes(token.role)) {
      logger.authError('unauthorized-access', 'Unauthorized user deletion attempt', {
        userId: token?.id,
        role: token?.role
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    logger.apiDebug('admin-user-delete', 'Deleting user', {
      adminId: token.id,
      userId: id
    });

    await prisma.user.delete({
      where: { id },
    });

    logger.adminInfo('user-deleted', 'User deleted successfully', {
      adminId: token.id,
      deletedUserId: id
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