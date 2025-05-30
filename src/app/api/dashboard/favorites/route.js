import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import serverLogger from '@/lib/server-logger';

export async function GET(req) {
  try {
    // Check if prisma is properly initialized
    if (!prisma) {
      serverLogger.apiError('favorites', 'Prisma client not initialized');
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // Check if favorite model exists
    if (!prisma.favorite) {
      serverLogger.apiError('favorites', 'Favorite model not found in Prisma client');
      return NextResponse.json(
        { 
          error: 'Favorites system not available',
          favorites: []
        },
        { status: 200 }
      );
    }

    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('auth');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    let session;
    try {
      session = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }
    
    if (!session?.user?.id || !session?.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;

    serverLogger.apiInfo('favorites', 'Fetching user favorites', { userId });

    // Get user's favorite properties
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: userId
      },
      include: {
        property: {
          include: {
            manager: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              }
            },
            reviews: {
              select: {
                rating: true,
              }
            },
            _count: {
              select: {
                bookings: true,
                reviews: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate average ratings for each property
    const favoritesWithRatings = favorites.map(favorite => {
      const property = favorite.property;
      const avgRating = property.reviews.length > 0 
        ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
        : 0;

      return {
        id: favorite.id,
        createdAt: favorite.createdAt,
        property: {
          ...property,
          averageRating: avgRating,
          totalBookings: property._count.bookings,
          totalReviews: property._count.reviews,
        }
      };
    });

    serverLogger.apiInfo('favorites', 'Favorites fetched successfully', {
      userId,
      count: favoritesWithRatings.length
    });

    return NextResponse.json(favoritesWithRatings);

  } catch (error) {
    serverLogger.apiError('favorites', 'Error fetching favorites', {
      error: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    // Check if prisma is properly initialized
    if (!prisma || !prisma.favorite) {
      serverLogger.apiError('favorites', 'Prisma client or favorite model not available');
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('auth');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    let session;
    try {
      session = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }
    
    if (!session?.user?.id || !session?.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const body = await req.json();
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    serverLogger.apiInfo('favorites', 'Adding property to favorites', {
      userId,
      propertyId
    });

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId: userId,
        propertyId: propertyId
      }
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Property already in favorites' },
        { status: 409 }
      );
    }

    // Add to favorites
    const favorite = await prisma.favorite.create({
      data: {
        userId: userId,
        propertyId: propertyId
      },
      include: {
        property: {
          select: {
            name: true,
            location: true,
            photos: true,
          }
        }
      }
    });

    serverLogger.apiInfo('favorites', 'Property added to favorites successfully', {
      userId,
      propertyId,
      favoriteId: favorite.id
    });

    return NextResponse.json({
      success: true,
      favorite: favorite
    });

  } catch (error) {
    serverLogger.apiError('favorites', 'Error adding to favorites', {
      error: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    // Check if prisma is properly initialized
    if (!prisma || !prisma.favorite) {
      serverLogger.apiError('favorites', 'Prisma client or favorite model not available');
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('auth');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    let session;
    try {
      session = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }
    
    if (!session?.user?.id || !session?.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    serverLogger.apiInfo('favorites', 'Removing property from favorites', {
      userId,
      propertyId
    });

    // Find and delete the favorite
    const deletedFavorite = await prisma.favorite.deleteMany({
      where: {
        userId: userId,
        propertyId: propertyId
      }
    });

    if (deletedFavorite.count === 0) {
      return NextResponse.json(
        { error: 'Favorite not found' },
        { status: 404 }
      );
    }

    serverLogger.apiInfo('favorites', 'Property removed from favorites successfully', {
      userId,
      propertyId
    });

    return NextResponse.json({
      success: true,
      message: 'Property removed from favorites'
    });

  } catch (error) {
    serverLogger.apiError('favorites', 'Error removing from favorites', {
      error: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 