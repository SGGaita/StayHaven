import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import serverLogger from '@/lib/server-logger';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Get user from cookie
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth');
    
    if (!authCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(decodeURIComponent(authCookie.value));
    } catch (error) {
      return NextResponse.json({ error: 'Invalid auth cookie' }, { status: 401 });
    }

    if (!session?.user?.id || !session?.isAuthenticated) {
      return NextResponse.json({ error: 'User not found in session' }, { status: 401 });
    }

    const user = session.user;

    // Only allow customers to access their spending data
    if (user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Access denied. Customer role required.' }, { status: 403 });
    }

    // Get URL parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const period = searchParams.get('period') || 'all';

    // Build where clause for filtering
    let whereClause = {
      customerId: user.id,
    };

    // Add status filter
    if (status !== 'all') {
      whereClause.status = status;
    }

    // Add period filter
    const now = new Date();
    if (period === 'thisMonth') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      whereClause.createdAt = {
        gte: startOfMonth,
      };
    } else if (period === 'lastMonth') {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      whereClause.createdAt = {
        gte: startOfLastMonth,
        lte: endOfLastMonth,
      };
    } else if (period === 'thisYear') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      whereClause.createdAt = {
        gte: startOfYear,
      };
    }

    // Fetch all bookings for the customer
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        property: {
          select: {
            name: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate total spent (only confirmed and completed bookings)
    const paidBookings = bookings.filter(booking => 
      booking.status === 'CONFIRMED' || booking.status === 'COMPLETED'
    );
    
    const totalSpent = paidBookings.reduce((sum, booking) => sum + booking.price, 0);

    // Calculate this month's spending
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthBookings = paidBookings.filter(booking => 
      booking.createdAt >= thisMonthStart
    );
    const thisMonth = thisMonthBookings.reduce((sum, booking) => sum + booking.price, 0);

    // Calculate average per booking
    const avgPerBooking = paidBookings.length > 0 ? totalSpent / paidBookings.length : 0;

    // Calculate monthly spending for the last 6 months
    const monthlySpending = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthBookings = paidBookings.filter(booking => 
        booking.createdAt >= monthStart && booking.createdAt <= monthEnd
      );
      
      const monthAmount = monthBookings.reduce((sum, booking) => sum + booking.price, 0);
      
      monthlySpending.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        amount: monthAmount,
      });
    }

    // Calculate category breakdown (simplified - you can expand this based on your needs)
    const categoryBreakdown = [
      {
        category: 'Accommodation',
        amount: totalSpent * 0.85, // Assuming 85% is accommodation
        percentage: 85,
      },
      {
        category: 'Service Fees',
        amount: totalSpent * 0.08, // 8% service fees
        percentage: 8,
      },
      {
        category: 'Cleaning Fees',
        amount: totalSpent * 0.05, // 5% cleaning fees
        percentage: 5,
      },
      {
        category: 'Taxes',
        amount: totalSpent * 0.02, // 2% taxes
        percentage: 2,
      },
    ];

    // Format recent transactions
    const recentTransactions = bookings.slice(0, 10).map(booking => ({
      id: booking.id,
      propertyName: booking.property.name,
      amount: booking.price,
      date: booking.createdAt.toISOString(),
      status: booking.status,
      bookingRef: booking.bookingRef,
      nights: Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24)),
      location: booking.property.location,
    }));

    const spendingData = {
      totalSpent: Math.round(totalSpent * 100) / 100,
      thisMonth: Math.round(thisMonth * 100) / 100,
      avgPerBooking: Math.round(avgPerBooking * 100) / 100,
      totalBookings: bookings.length,
      monthlySpending,
      categoryBreakdown: categoryBreakdown.map(cat => ({
        ...cat,
        amount: Math.round(cat.amount * 100) / 100,
      })),
      recentTransactions,
    };

    serverLogger.apiInfo('spending-data', 'Spending data fetched successfully', {
      userId: user.id,
      totalBookings: bookings.length,
      totalSpent: spendingData.totalSpent,
    });

    return NextResponse.json(spendingData);

  } catch (error) {
    serverLogger.apiError('spending-data', 'Error fetching spending data', { error });
    return NextResponse.json(
      { error: 'Failed to fetch spending data' },
      { status: 500 }
    );
  }
} 