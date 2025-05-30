import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import serverLogger from '@/lib/server-logger';
import { uploadFile } from '@/lib/uploadFile';
import { ensureUploadDir } from '@/lib/ensureUploadDir';
import { cookies } from 'next/headers';  // Add this to get cookies
import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const sortBy = searchParams.get('sortBy') || 'newest';
    const minPrice = parseFloat(searchParams.get('minPrice')) || 0;
    const maxPrice = parseFloat(searchParams.get('maxPrice')) || 999999;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      AND: [
        // Price range filter
        {
          price: {
            gte: minPrice,
            lte: maxPrice,
          },
        },
        // Search filter (name, description, location)
        search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
          ],
        } : {},
        // Property type filter
        type ? { propertyType: type } : {},
        // Only show available properties
        { available: true },
      ].filter(condition => Object.keys(condition).length > 0),
    };

    // Build orderBy clause
    let orderBy = {};
    switch (sortBy) {
      case 'price_low':
        orderBy = { price: 'asc' };
        break;
      case 'price_high':
        orderBy = { price: 'desc' };
        break;
      case 'rating':
        orderBy = { averageRating: 'desc' };
        break;
      case 'popular':
        orderBy = { totalBookings: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Check if Prisma client and Property model are available
    if (!prismaClient?.property) {
      console.warn('[API][properties] Property model not available, returning mock data');
      
      // Return mock data for development
      const mockProperties = [
        {
          id: '1',
          name: 'Luxury Beach Villa',
          description: 'Beautiful oceanfront villa with stunning views',
          location: 'Malibu, CA',
          price: 450,
          propertyType: 'Villa',
          bedrooms: 4,
          bathrooms: 3,
          maxGuests: 8,
          photos: ['/placeholder-property.jpg'],
          averageRating: 4.8,
          totalReviews: 24,
          available: true,
          amenities: ['Pool', 'WiFi', 'Kitchen', 'Parking'],
        },
        {
          id: '2',
          name: 'Cozy Mountain Cabin',
          description: 'Perfect retreat in the mountains',
          location: 'Aspen, CO',
          price: 280,
          propertyType: 'Cabin',
          bedrooms: 2,
          bathrooms: 2,
          maxGuests: 4,
          photos: ['/placeholder-property.jpg'],
          averageRating: 4.6,
          totalReviews: 18,
          available: true,
          amenities: ['WiFi', 'Kitchen', 'Parking'],
        },
        {
          id: '3',
          name: 'Modern City Apartment',
          description: 'Stylish apartment in downtown',
          location: 'New York, NY',
          price: 320,
          propertyType: 'Apartment',
          bedrooms: 2,
          bathrooms: 1,
          maxGuests: 4,
          photos: ['/placeholder-property.jpg'],
          averageRating: 4.5,
          totalReviews: 32,
          available: true,
          amenities: ['WiFi', 'Kitchen', 'AC'],
        },
      ];

      // Apply filters to mock data
      let filteredProperties = mockProperties.filter(property => {
        if (property.price < minPrice || property.price > maxPrice) return false;
        if (type && property.propertyType !== type) return false;
        if (search) {
          const searchLower = search.toLowerCase();
          return (
            property.name.toLowerCase().includes(searchLower) ||
            property.description.toLowerCase().includes(searchLower) ||
            property.location.toLowerCase().includes(searchLower)
          );
        }
        return true;
      });

      // Apply sorting to mock data
      filteredProperties.sort((a, b) => {
        switch (sortBy) {
          case 'price_low':
            return a.price - b.price;
          case 'price_high':
            return b.price - a.price;
          case 'rating':
            return b.averageRating - a.averageRating;
          case 'popular':
            return (b.totalReviews || 0) - (a.totalReviews || 0);
          case 'newest':
          default:
            return 0; // Mock data doesn't have dates
        }
      });

      // Apply pagination to mock data
      const totalProperties = filteredProperties.length;
      const totalPages = Math.ceil(totalProperties / limit);
      const paginatedProperties = filteredProperties.slice(skip, skip + limit);

      return NextResponse.json({
        properties: paginatedProperties,
        pagination: {
          currentPage: page,
          totalPages,
          totalProperties,
          hasMore: page < totalPages,
        },
        totalPages, // For backwards compatibility
      });
    }

    // Fetch properties from database
    const [properties, totalCount] = await Promise.all([
      prismaClient.property.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          photos: {
            take: 1, // Only get the first photo for listing
            orderBy: { order: 'asc' },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
          _count: {
            select: {
              bookings: true,
              reviews: true,
            },
          },
        },
      }),
      prismaClient.property.count({ where }),
    ]);

    // Transform the data
    const transformedProperties = properties.map(property => ({
      id: property.id,
      name: property.name,
      description: property.description,
      location: property.location,
      price: property.price,
      propertyType: property.propertyType,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      maxGuests: property.maxGuests,
      photos: property.photos?.map(photo => photo.url) || [],
      averageRating: property.reviews?.length > 0 
        ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
        : 0,
      totalReviews: property._count?.reviews || 0,
      totalBookings: property._count?.bookings || 0,
      available: property.available,
      amenities: property.amenities || [],
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      properties: transformedProperties,
      pagination: {
        currentPage: page,
        totalPages,
        totalProperties: totalCount,
        hasMore: page < totalPages,
      },
      totalPages, // For backwards compatibility
    });

  } catch (error) {
    console.error('[API][properties] Error fetching properties:', error);
    
    // Return graceful fallback
    return NextResponse.json({
      properties: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalProperties: 0,
        hasMore: false,
      },
      totalPages: 0,
      error: 'Unable to fetch properties at this time',
    }, { status: 200 }); // Return 200 with error message instead of 500
  } finally {
    await prismaClient.$disconnect();
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