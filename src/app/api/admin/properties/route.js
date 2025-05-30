import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import serverLogger from '@/lib/server-logger';
import { cookies } from 'next/headers';

// Helper function to get and validate session
async function getAuthenticatedSession() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('auth');

  if (!sessionCookie) {
    return { error: 'No session cookie found', status: 401 };
  }

  let session;
  try {
    session = JSON.parse(decodeURIComponent(sessionCookie.value));
  } catch (error) {
    return { error: 'Invalid session cookie', status: 401 };
  }

  if (!session?.user?.id || !session?.user?.role || !session.isAuthenticated) {
    return { error: 'Invalid session data', status: 401 };
  }

  if (!['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    return { error: 'Admin access required', status: 403 };
  }

  return { session };
}

// Helper function to build the where clause for property search
const buildWhereClause = (search, type) => {
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
      { manager: { 
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } }
        ]
      }},
    ];
  }

  if (type && type !== 'All Types') {
    where.propertyType = type;
  }

  return where;
};

export async function GET(request) {
  try {
    // Check authentication and authorization
    const authResult = await getAuthenticatedSession();
    if (authResult.error) {
      serverLogger.apiWarn('admin-properties', authResult.error);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Unauthorized access',
          details: authResult.error
        }),
        { 
          status: authResult.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { session } = authResult;
    const userId = session.user.id;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build where clause for search and filters
    const where = buildWhereClause(search, type);

    serverLogger.adminInfo('admin-properties', 'Fetching properties', { 
      userId, 
      page, 
      limit, 
      search, 
      type 
    });

    try {
    // Get total count for pagination
    const total = await prisma.property.count({ where });

    // Get properties with pagination, search, and filters
    const properties = await prisma.property.findMany({
      where,
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate average rating for each property
    const propertiesWithStats = properties.map(property => {
      const reviews = property.reviews || [];
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

      return {
        ...property,
        rating: averageRating,
        reviewCount: reviews.length,
        reviews: undefined, // Remove raw reviews from response
      };
    });

      serverLogger.adminInfo('admin-properties', 'Properties fetched successfully', {
        userId,
        count: propertiesWithStats.length,
        total
      });

      return new NextResponse(
        JSON.stringify({
      properties: propertiesWithStats,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (dbError) {
      serverLogger.apiError('admin-properties', 'Database error', {
        error: dbError.message,
        stack: dbError.stack,
        userId
      });
      return new NextResponse(
        JSON.stringify({ 
          error: 'Database error',
          details: dbError.message
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    serverLogger.apiError('admin-properties', 'Error in admin properties GET', {
      error: error.message,
      stack: error.stack
    });
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function PUT(request) {
  try {
    // Check authentication and authorization
    const authResult = await getAuthenticatedSession();
    if (authResult.error) {
      serverLogger.apiWarn('admin-properties', authResult.error);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Unauthorized access',
          details: authResult.error
        }),
        { 
          status: authResult.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { session } = authResult;
    const userId = session.user.id;

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Property ID is required'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    serverLogger.adminInfo('admin-properties', 'Updating property', { 
      userId, 
      propertyId: id,
      updateFields: Object.keys(updateData)
    });

    try {
    // Update property
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

      serverLogger.adminInfo('admin-properties', 'Property updated successfully', {
        userId,
        propertyId: id
      });

      return new NextResponse(
        JSON.stringify(updatedProperty),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (dbError) {
      serverLogger.apiError('admin-properties', 'Database error during update', {
        error: dbError.message,
        stack: dbError.stack,
        userId,
        propertyId: id
      });
      return new NextResponse(
        JSON.stringify({ 
          error: 'Database error',
          details: dbError.message
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    serverLogger.apiError('admin-properties', 'Error in admin properties PUT', {
      error: error.message,
      stack: error.stack
    });
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function DELETE(request) {
  try {
    // Check authentication and authorization
    const authResult = await getAuthenticatedSession();
    if (authResult.error) {
      serverLogger.apiWarn('admin-properties', authResult.error);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Unauthorized access',
          details: authResult.error
        }),
        { 
          status: authResult.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { session } = authResult;
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Property ID is required'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    serverLogger.adminInfo('admin-properties', 'Deleting property', { 
      userId, 
      propertyId: id
    });

    try {
    // Delete property
    await prisma.property.delete({
      where: { id },
    });

      serverLogger.adminInfo('admin-properties', 'Property deleted successfully', {
        userId,
        propertyId: id
      });

      return new NextResponse(
        JSON.stringify({ success: true }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (dbError) {
      serverLogger.apiError('admin-properties', 'Database error during deletion', {
        error: dbError.message,
        stack: dbError.stack,
        userId,
        propertyId: id
      });
      return new NextResponse(
        JSON.stringify({ 
          error: 'Database error',
          details: dbError.message
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    serverLogger.apiError('admin-properties', 'Error in admin properties DELETE', {
      error: error.message,
      stack: error.stack
    });
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 