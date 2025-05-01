import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

export async function GET(request) {
  try {
    // Get the user's token
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('properties', 'Fetching properties', { userId: token.id, role: token.role });

    // Define the query based on user role
    let query = {
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    };

    // Add role-specific filters
    if (token.role === 'PROPERTY_MANAGER') {
      query.where = {
        managerId: token.id,
      };
    } else if (token.role === 'SUPER_ADMIN') {
      // Super admin can see all properties
    } else {
      // Customers should only see published/active properties
      query.where = {
        status: 'ACTIVE',
      };
    }

    const properties = await prisma.property.findMany(query);

    // Calculate average rating for each property
    const propertiesWithRating = properties.map((property) => {
      const avgRating =
        property.reviews.length > 0
          ? property.reviews.reduce((acc, review) => acc + review.rating, 0) /
            property.reviews.length
          : null;

      const { reviews, ...propertyWithoutReviews } = property;
      return {
        ...propertyWithoutReviews,
        avgRating,
      };
    });

    logger.info('properties', 'Properties fetched successfully', {
      userId: token.id,
      role: token.role,
      count: propertiesWithRating.length,
    });

    return NextResponse.json(propertiesWithRating);
  } catch (error) {
    logger.error('properties', 'Error fetching properties', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const token = await getToken({ req: request });
    if (!token || (token.role !== 'PROPERTY_MANAGER' && token.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const propertyId = url.pathname.split('/').pop();

    // Verify property ownership for property managers
    if (token.role === 'PROPERTY_MANAGER') {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { managerId: true },
      });

      if (!property || property.managerId !== token.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    await prisma.property.delete({
      where: { id: propertyId },
    });

    logger.info('properties', 'Property deleted successfully', {
      userId: token.id,
      propertyId,
    });

    return NextResponse.json({ message: 'Property deleted successfully' });
  } catch (error) {
    logger.error('properties', 'Error deleting property', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 