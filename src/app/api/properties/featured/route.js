import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get active properties with high ratings
    const properties = await prisma.property.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
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

    // Calculate average rating and format the response
    const featuredProperties = properties.map(property => {
      const reviews = property.reviews || [];
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

      // Remove reviews array and format the response
      const { reviews: _, ...propertyWithoutReviews } = property;
      return {
        ...propertyWithoutReviews,
        avgRating: parseFloat(avgRating.toFixed(1)),
        reviewCount: reviews.length,
        ownerName: `${property.manager.firstName} ${property.manager.lastName}`,
      };
    });

    if (featuredProperties.length === 0) {
      return NextResponse.json([]);
    }

    return NextResponse.json(featuredProperties);
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured properties' },
      { status: 500 }
    );
  }
} 