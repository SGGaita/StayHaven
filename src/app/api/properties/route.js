import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';
import { uploadFile } from '@/lib/uploadFile';
import { ensureUploadDir } from '@/lib/ensureUploadDir';

export async function GET(request) {
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('properties', 'Fetching properties', { userId: session.user.id, role: session.user.role });

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
    if (session.user.role === 'PROPERTY_MANAGER') {
      query.where = {
        managerId: session.user.id,
      };
    } else if (session.user.role === 'SUPER_ADMIN') {
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
      userId: session.user.id,
      role: session.user.role,
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
    // Get the user's session
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'PROPERTY_MANAGER' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const propertyId = url.pathname.split('/').pop();

    // Verify property ownership for property managers
    if (session.user.role === 'PROPERTY_MANAGER') {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { managerId: true },
      });

      if (!property || property.managerId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    await prisma.property.delete({
      where: { id: propertyId },
    });

    logger.info('properties', 'Property deleted successfully', {
      userId: session.user.id,
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

export async function POST(request) {
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'PROPERTY_MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure upload directory exists
    await ensureUploadDir();

    // Parse form data
    const formData = await request.formData();
    
    // Get basic property data
    const name = formData.get('name');
    const description = formData.get('description');
    const propertyType = formData.get('propertyType');
    const price = parseFloat(formData.get('price'));
    const amenities = JSON.parse(formData.get('amenities'));
    const location = JSON.parse(formData.get('location'));
    const coverPhotoIndex = parseInt(formData.get('coverPhotoIndex'));

    // Validate required fields
    if (!name || !description || !propertyType || !price || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upload photos
    const photos = formData.getAll('photos');
    const photoUrls = await Promise.all(
      photos.map(photo => uploadFile(photo))
    );

    // Create new property
    const property = await prisma.property.create({
      data: {
        name,
        description,
        propertyType,
        price,
        amenities,
        location: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        photos: photoUrls,
        coverPhoto: photoUrls[coverPhotoIndex],
        status: 'PENDING', // New properties need admin approval
        managerId: session.user.id,
      },
    });

    logger.info('properties', 'Property created successfully', {
      userId: session.user.id,
      propertyId: property.id,
    });

    return NextResponse.json(property);
  } catch (error) {
    logger.error('properties', 'Error creating property', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 