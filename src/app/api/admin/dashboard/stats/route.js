import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Check authentication and admin role
    const authCookie = request.cookies.get('auth');
    if (!authCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(decodeURIComponent(authCookie.value));
    } catch (error) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    if (!session?.user?.id || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Mock data for comprehensive admin stats
    // In a real application, these would be database queries
    const stats = {
      // User statistics
      totalUsers: 1247,
      propertyManagers: 89,
      customers: 1158,
      
      // Subscription statistics
      activeSubscriptions: 67,
      subscriptionRevenue: 8950,
      
      // Property statistics
      totalProperties: 234,
      activeProperties: 198,
      pendingProperties: 12,
      
      // Revenue statistics
      monthlyRevenue: 45780,
      yearlyRevenue: 487650,
      
      // System health and activity
      systemHealth: 96,
      pendingVerifications: 8,
      newAccounts: 15,
      
      // Growth metrics
      userGrowth: 12.5,
      revenueGrowth: 8.2,
      propertyGrowth: 15.3,
      
      // Recent activity counts
      messagesCount: 23,
      accountsDueCount: 5,
      supportTickets: 7,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 