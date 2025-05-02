import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

export async function GET() {
  try {
    // Get active properties with high ratings
    const properties = await prisma.property.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      take: 6, // Limit to 6 featured properties
      orderBy: [
        {
          createdAt: 'desc', // Show newest properties first
        },
      ],
    });

    // Calculate average rating for each property
    const featuredProperties = properties.map(property => {
      const reviews = property.reviews || [];
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

      const { reviews: _, ...propertyWithoutReviews } = property;
      return {
        ...propertyWithoutReviews,
        avgRating,
        reviewCount: reviews.length,
      };
    });

    logger.info('properties-featured', 'Featured properties fetched successfully', {
      count: featuredProperties.length,
    });

    return NextResponse.json(featuredProperties);
  } catch (error) {
    logger.error('properties-featured', 'Error fetching featured properties', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 