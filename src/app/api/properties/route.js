import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import serverLogger from '@/lib/server-logger';
import { uploadFile } from '@/lib/uploadFile';
import { ensureUploadDir } from '@/lib/ensureUploadDir';
import { cookies } from 'next/headers';  // Add this to get cookies

export async function GET(request) {
  try {
    // Parse auth headers
    const authHeader = request.headers.get('Authorization');
    const userRole = request.headers.get('X-User-Role');
    const userId = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    // Log authentication data for debugging
    serverLogger.info('properties-get', 'Auth check in GET request', { 
      hasAuthHeader: !!authHeader,
      userId: userId || 'none',
      userRole: userRole || 'none',
    });

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
    if (userRole === 'PROPERTY_MANAGER' && userId) {
      // Property managers can see all their own properties
      query.where = {
        managerId: userId,
      };
      serverLogger.info('properties', 'Filtering by manager ID', { managerId: userId });
    } else if (userRole === 'SUPER_ADMIN') {
      // Super admins can see all properties
      // No filter needed
      serverLogger.info('properties', 'Admin view - showing all properties');
    } else {
      // For customers or unauthenticated users, only show active properties
      query.where = {
        status: 'ACTIVE',
      };
      serverLogger.info('properties', 'Public view - showing only active properties');
    }

    const properties = await prisma.property.findMany(query);

    // Calculate average rating for each property
    const propertiesWithRating = properties.map((property) => {
      const avgRating =
        property.reviews && property.reviews.length > 0
          ? property.reviews.reduce((acc, review) => acc + review.rating, 0) /
            property.reviews.length
          : null;

      const { reviews, ...propertyWithoutReviews } = property;
      
      // Extract amenities and metadata
      let amenitiesList = [];
      let coverPhotoIndex = 0;
      
      if (property.amenities) {
        // Handle both new format (with metadata) and old format (just array)
        if (typeof property.amenities === 'object' && property.amenities.items) {
          amenitiesList = property.amenities.items;
          coverPhotoIndex = property.amenities.metadata?.coverPhotoIndex || 0;
        } else {
          amenitiesList = Array.isArray(property.amenities) ? property.amenities : [];
        }
      }
      
      return {
        ...propertyWithoutReviews,
        amenities: amenitiesList, // Return just the amenities array for backward compatibility
        coverPhotoIndex, // Add the cover photo index to the response
        avgRating,
      };
    });

    serverLogger.info('properties', 'Properties fetched successfully', {
      count: propertiesWithRating.length,
    });

    return NextResponse.json(propertiesWithRating);
  } catch (error) {
    serverLogger.error('properties', 'Error fetching properties', {
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
    // Parse auth headers
    const authHeader = request.headers.get('Authorization');
    const userRole = request.headers.get('X-User-Role');
    const userId = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    serverLogger.info('properties-delete', 'Auth check in DELETE request', { 
      hasAuthHeader: !!authHeader,
      userId: userId || 'none',
      userRole: userRole || 'none',
    });
    
    // Check if user is authorized
    if (!userId || (userRole !== 'PROPERTY_MANAGER' && userRole !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extract property ID from URL
    const url = new URL(request.url);
    const propertyId = url.pathname.split('/').pop();

    // If user is property manager, verify ownership
    if (userRole === 'PROPERTY_MANAGER') {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { managerId: true },
      });

      if (!property || property.managerId !== userId) {
        return NextResponse.json({ error: 'Forbidden - You can only delete your own properties' }, { status: 403 });
      }
    }

    await prisma.property.delete({
      where: { id: propertyId },
    });

    serverLogger.info('properties', 'Property deleted successfully', {
      userId,
      propertyId,
    });

    return NextResponse.json({ message: 'Property deleted successfully' });
  } catch (error) {
    serverLogger.error('properties', 'Error deleting property', {
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
    // Parse auth headers
    const authHeader = request.headers.get('Authorization');
    const userRole = request.headers.get('X-User-Role');
    const userId = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    // Log authentication data for debugging
    serverLogger.info('properties-create', 'Auth check in POST request', { 
      hasAuthHeader: !!authHeader,
      userId: userId || 'none',
      userRole: userRole || 'none',
    });
    
    // Check if user is authorized
    if (!userId || userRole !== 'PROPERTY_MANAGER') {
      return NextResponse.json({ error: 'Unauthorized - You must be a property manager to create properties' }, { status: 401 });
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

    // Create enhanced amenities with metadata including coverPhotoIndex
    const enhancedAmenities = {
      items: amenities,
      metadata: {
        coverPhotoIndex: coverPhotoIndex
      }
    };

    // Create new property
    const property = await prisma.property.create({
      data: {
        name,
        description,
        propertyType,
        price,
        amenities: enhancedAmenities,
        location: location.address,
        lat: location.latitude,
        lng: location.longitude,
        photos: photoUrls,
        status: 'PENDING', // New properties need admin approval
        managerId: userId,
      },
    });

    serverLogger.info('properties', 'Property created successfully', {
      userId: userId,
      propertyId: property.id,
    });

    return NextResponse.json(property);
  } catch (error) {
    serverLogger.error('properties', 'Error creating property', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 