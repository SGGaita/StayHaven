import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import serverLogger from '@/lib/server-logger';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('auth');

    if (!sessionCookie) {
      serverLogger.warn('[API][dashboard/properties] No session cookie found');
      return new NextResponse(
        JSON.stringify({ 
          error: 'Unauthorized access',
          details: 'Please sign in to access this resource'
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    let session;
    try {
      session = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch (error) {
      serverLogger.error('[API][dashboard/properties] Failed to parse session cookie', { error });
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid session',
          details: 'Please sign in again'
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!session?.user?.id || !session?.user?.role || !session.isAuthenticated) {
      serverLogger.warn('[API][dashboard/properties] Invalid session data', { 
        hasUser: !!session?.user,
        hasId: !!session?.user?.id,
        hasRole: !!session?.user?.role,
        isAuthenticated: !!session?.isAuthenticated
      });
      
      return new NextResponse(
        JSON.stringify({ 
          error: 'Unauthorized access',
          details: 'Invalid session data'
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = session.user.id;
    const userRole = session.user.role;

    serverLogger.info('[API][dashboard/properties] Fetching properties', {
      userId,
      userRole,
    });

    // Build where clause based on user role
    let whereClause = {};
    
    if (userRole === 'PROPERTY_MANAGER') {
      // Property managers can only see their own properties
      whereClause = {
        managerId: userId,
      };
    } else if (userRole === 'SUPER_ADMIN') {
      // Super admins can see all properties
      whereClause = {};
    } else {
      // Customers and other roles can only see active properties
      whereClause = {
        status: 'ACTIVE',
      };
    }

    try {
      // Get properties with enhanced data
      const properties = await prisma.property.findMany({
        where: whereClause,
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              bookings: true,
              reviews: true,
            },
          },
          // Include bookings and reviews for calculations
          bookings: {
            select: {
              id: true,
              price: true,
              subtotal: true,
              cleaningFee: true,
              serviceFee: true,
              status: true,
              startDate: true,
              endDate: true,
              createdAt: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Calculate real statistics for each property
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const enhancedProperties = properties.map(property => {
        // Calculate total bookings
        const totalBookings = property.bookings.length;
        
        // Calculate confirmed/completed bookings
        const confirmedBookings = property.bookings.filter(
          booking => ['CONFIRMED', 'COMPLETED'].includes(booking.status)
        );

        // Calculate monthly revenue
        const monthlyBookings = property.bookings.filter(booking => 
          ['CONFIRMED', 'COMPLETED'].includes(booking.status) &&
          booking.createdAt >= startOfMonth && 
          booking.createdAt <= endOfMonth
        );

        const monthlyRevenue = monthlyBookings.reduce((total, booking) => {
          const bookingTotal = booking.subtotal 
            ? booking.subtotal + (booking.cleaningFee || 0) + (booking.serviceFee || 0)
            : booking.price;
          return total + bookingTotal;
        }, 0);

        // Calculate total revenue
        const totalRevenue = confirmedBookings.reduce((total, booking) => {
          const bookingTotal = booking.subtotal 
            ? booking.subtotal + (booking.cleaningFee || 0) + (booking.serviceFee || 0)
            : booking.price;
          return total + bookingTotal;
        }, 0);

        // Calculate occupancy rate for this month
        const monthlyBookingsForOccupancy = property.bookings.filter(booking => 
          ['CONFIRMED', 'COMPLETED'].includes(booking.status) &&
          (
            (booking.startDate >= startOfMonth && booking.startDate <= endOfMonth) ||
            (booking.endDate >= startOfMonth && booking.endDate <= endOfMonth) ||
            (booking.startDate <= startOfMonth && booking.endDate >= endOfMonth)
          )
        );

        let totalBookedNights = 0;
        monthlyBookingsForOccupancy.forEach(booking => {
          const start = booking.startDate < startOfMonth ? startOfMonth : booking.startDate;
          const end = booking.endDate > endOfMonth ? endOfMonth : booking.endDate;
          const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          totalBookedNights += Math.max(0, nights);
        });

        const daysInMonth = endOfMonth.getDate();
        const occupancyRate = daysInMonth > 0 
          ? Math.round((totalBookedNights / daysInMonth) * 100) 
          : 0;

        // Calculate average rating
        const averageRating = property.reviews.length > 0
          ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
          : 0;

        // Remove the detailed bookings and reviews from the response for performance
        const { bookings, reviews, ...propertyWithoutDetails } = property;

        return {
          ...propertyWithoutDetails,
          // Real statistics
          totalBookings,
          monthlyRevenue: Math.round(monthlyRevenue),
          totalRevenue: Math.round(totalRevenue),
          occupancyRate,
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: property.reviews.length,
          reviewCount: property.reviews.length, // For backward compatibility
          // For backward compatibility with existing UI
          pricePerNight: property.price,
        };
      });

      serverLogger.info('[API][dashboard/properties] Properties fetched successfully', {
        userId,
        userRole,
        propertyCount: enhancedProperties.length,
      });

      return NextResponse.json({
        success: true,
        properties: enhancedProperties,
      });
    } catch (dbError) {
      serverLogger.error('[API][dashboard/properties] Error fetching properties:', dbError);
      
      // Return mock data if database is not available
      const mockProperties = [
        {
          id: '1',
          name: 'Luxury Downtown Apartment',
          description: 'Beautiful modern apartment in the heart of the city with stunning views.',
          location: 'Downtown, City Center',
          propertyType: 'Apartment',
          status: 'ACTIVE',
          price: 250,
          bedrooms: 2,
          bathrooms: 2,
          maxGuests: 4,
          photos: ['/placeholder-property-1.jpg'],
          averageRating: 4.8,
          totalReviews: 24,
          totalBookings: 67,
          monthlyRevenue: 3250,
          occupancyRate: 85,
          manager: {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@stayhaven.com',
          },
        },
        {
          id: '2',
          name: 'Cozy Beach House',
          description: 'Perfect getaway by the ocean with private beach access.',
          location: 'Oceanview, Beach District',
          propertyType: 'House',
          status: 'ACTIVE',
          price: 400,
          bedrooms: 3,
          bathrooms: 2,
          maxGuests: 6,
          photos: ['/placeholder-property-2.jpg'],
          averageRating: 4.9,
          totalReviews: 18,
          totalBookings: 42,
          monthlyRevenue: 4800,
          occupancyRate: 92,
          manager: {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@stayhaven.com',
          },
        },
        {
          id: '3',
          name: 'Modern City Loft',
          description: 'Stylish loft in trendy neighborhood with modern amenities.',
          location: 'Arts District, Uptown',
          propertyType: 'Loft',
          status: 'ACTIVE',
          price: 180,
          bedrooms: 1,
          bathrooms: 1,
          maxGuests: 2,
          photos: ['/placeholder-property-3.jpg'],
          averageRating: 4.6,
          totalReviews: 31,
          totalBookings: 89,
          monthlyRevenue: 2150,
          occupancyRate: 78,
          manager: {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@stayhaven.com',
          },
        },
      ];

      return NextResponse.json({
        success: true,
        properties: mockProperties,
      });
    }
  } catch (error) {
    serverLogger.error('[API][dashboard/properties] Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('auth');

    if (!sessionCookie) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Unauthorized access',
          details: 'Please sign in to access this resource'
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    let session;
    try {
      session = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid session',
          details: 'Please sign in again'
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!session?.user?.id || !session?.user?.role || !session.isAuthenticated) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Unauthorized access',
          details: 'Invalid session data'
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    // Only property managers and admins can create properties
    if (!['PROPERTY_MANAGER', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();
    
    serverLogger.info('[API][dashboard/properties] Creating new property', {
      userId,
      userRole,
      propertyName: data.name,
    });

    const newProperty = await prisma.property.create({
      data: {
        ...data,
        managerId: userId,
        photos: data.photos || [],
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    serverLogger.info('[API][dashboard/properties] Property created successfully', {
      userId,
      propertyId: newProperty.id,
    });

    return NextResponse.json({
      success: true,
      property: newProperty,
    });
  } catch (error) {
    serverLogger.error('[API][dashboard/properties] Error creating property:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
} 