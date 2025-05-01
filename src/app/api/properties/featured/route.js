import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const featuredProperties = await prisma.property.findMany({
      take: 6,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Calculate average rating for each property
    const propertiesWithRating = featuredProperties.map((property) => {
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

    return NextResponse.json(propertiesWithRating);
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 