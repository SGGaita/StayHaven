import prisma from '@/lib/prisma';

/**
 * Get a list of featured properties
 * @param {number} limit - Number of properties to return
 * @returns {Promise<Array>} Array of property objects
 */
export async function getFeaturedProperties(limit = 6) {
  try {
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
      take: limit,
      orderBy: {
        createdAt: 'desc', // Get newest properties first
      },
    });

    // Calculate average rating for each property
    return properties.map(property => {
      const avgRating = property.reviews.length > 0
        ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
        : 0;
      
      return {
        id: property.id,
        name: property.name,
        location: property.location,
        propertyType: property.propertyType,
        price: property.price,
        photos: property.photos,
        amenities: property.amenities || [],
        avgRating: parseFloat(avgRating.toFixed(1)),
        reviewCount: property.reviews.length,
        status: property.status
      };
    });
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    return [];
  }
} 