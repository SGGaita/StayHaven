import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import logger from '@/lib/server-logger';
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('auth');

    if (!sessionCookie) {
      logger.authError('admin-users-stats-access', 'No session cookie found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch (error) {
      logger.authError('admin-users-stats-access', 'Failed to parse session cookie', { error });
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    if (!session?.user?.id || !session?.user?.role || !session.isAuthenticated) {
      logger.authError('admin-users-stats-access', 'Invalid session data', { 
        hasUser: !!session?.user,
        hasId: !!session?.user?.id,
        hasRole: !!session?.user?.role,
        isAuthenticated: !!session?.isAuthenticated
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      logger.authError('unauthorized-access', 'Non-admin access attempt to user stats', { 
        userId: session.user.id,
        role: session.user.role 
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.apiDebug('admin-users-stats', 'Fetching user statistics', {
      adminId: session.user.id
    });

    // Get current date for monthly calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch user statistics
    const [
      totalUsers,
      usersByRole,
      usersByStatus,
      newUsersThisMonth
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),
      
      // Users grouped by role
      prisma.user.groupBy({
        by: ['role'],
        _count: {
          id: true,
        },
      }),
      
      // Users grouped by verification status
      prisma.user.groupBy({
        by: ['verificationStatus'],
        _count: {
          id: true,
        },
      }),
      
      // New users this month
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),
    ]);

    // Process role statistics
    const roleStats = {
      superAdmins: 0,
      admins: 0,
      propertyManagers: 0,
      customers: 0,
    };

    usersByRole.forEach(group => {
      switch (group.role) {
        case 'SUPER_ADMIN':
          roleStats.superAdmins = group._count.id;
          break;
        case 'ADMIN':
          roleStats.admins = group._count.id;
          break;
        case 'PROPERTY_MANAGER':
          roleStats.propertyManagers = group._count.id;
          break;
        case 'CUSTOMER':
          roleStats.customers = group._count.id;
          break;
      }
    });

    // Process status statistics
    const statusStats = {
      verified: 0,
      pending: 0,
      rejected: 0,
      blocked: 0,
    };

    usersByStatus.forEach(group => {
      switch (group.verificationStatus) {
        case 'VERIFIED':
          statusStats.verified = group._count.id;
          break;
        case 'PENDING':
          statusStats.pending = group._count.id;
          break;
        case 'REJECTED':
          statusStats.rejected = group._count.id;
          break;
        case 'BLOCKED':
          statusStats.blocked = group._count.id;
          break;
      }
    });

    const stats = {
      total: totalUsers,
      ...roleStats,
      ...statusStats,
      newThisMonth: newUsersThisMonth,
    };

    logger.adminInfo('users-stats-fetched', 'User statistics fetched successfully', {
      adminId: session.user.id,
      stats,
    });

    return NextResponse.json(stats);
  } catch (error) {
    logger.apiError('admin-users-stats', 'Failed to fetch user statistics', {
      error: error.message,
      stack: error.stack,
    });
    
    // Return fallback stats in case of error
    return NextResponse.json({
      total: 0,
      superAdmins: 0,
      admins: 0,
      propertyManagers: 0,
      customers: 0,
      verified: 0,
      pending: 0,
      rejected: 0,
      blocked: 0,
      newThisMonth: 0,
    });
  }
} 