import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import serverLogger from '@/lib/server-logger';

export async function GET(request, { params }) {
  try {
    // Parse auth headers
    const authHeader = request.headers.get('Authorization');
    const userRole = request.headers.get('X-User-Role');
    const userId = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    // Debug auth data
    serverLogger.apiInfo('property-get', 'Auth check in GET property request', { 
      propertyId: params.id,
      hasAuthHeader: !!authHeader,
      userId: userId || 'none',
      userRole: userRole || 'none',
    });
    
    // Fetch the property
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileInfo: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // For non-admin/non-owner users, only show active properties
    const isAuthenticated = !!userId;
    const isPropertyOwner = userRole === 'PROPERTY_MANAGER' && property.managerId === userId;
    const isAdmin = userRole === 'SUPER_ADMIN';
    
    // If property is not active and the user isn't authorized to see it
    if (property.status !== 'ACTIVE' && !isAdmin && !isPropertyOwner) {
      return NextResponse.json({ error: 'Property not found or not available' }, { status: 404 });
    }

    // Process amenities field
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

    // Calculate average rating
    const avgRating = property.reviews.length > 0
      ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
      : null;

    // Return processed property data
    return NextResponse.json({
      ...property,
      amenities: amenitiesList,
      coverPhotoIndex,
      avgRating
    });
  } catch (error) {
    serverLogger.apiError('property-get', 'Error fetching property', {
      error: error.message,
      propertyId: params.id,
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    // Parse auth headers
    const authHeader = request.headers.get('Authorization');
    const userRole = request.headers.get('X-User-Role');
    const userId = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    // Debug auth data
    serverLogger.apiInfo('property-update', 'Auth check in PUT property request', { 
      propertyId: params.id,
      hasAuthHeader: !!authHeader,
      userId: userId || 'none',
      userRole: userRole || 'none',
    });
    
    // Check if user is authorized
    if (!userId || (userRole !== 'PROPERTY_MANAGER' && userRole !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const property = await prisma.property.findUnique({
      where: { id: params.id },
      select: { managerId: true },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Verify property ownership for property managers
    if (userRole === 'PROPERTY_MANAGER' && property.managerId !== userId) {
      return NextResponse.json({ error: 'Forbidden - You can only edit your own properties' }, { status: 403 });
    }

    const data = await request.json();
    
    // Validate status if it's being updated
    if (data.status && !['ACTIVE', 'PENDING', 'MAINTENANCE', 'ARCHIVED'].includes(data.status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const updateData = {
      ...(data.name && { name: data.name }),
      ...(data.description && { description: data.description }),
      ...(data.location && { location: data.location }),
      ...(data.propertyType && { propertyType: data.propertyType }),
      ...(data.amenities && { amenities: data.amenities }),
      ...(data.photos && { photos: data.photos }),
      ...(data.basePrice && { price: parseFloat(data.basePrice) }),
      ...(data.price && { price: parseFloat(data.price) }),
      ...(data.lat && { lat: data.lat }),
      ...(data.lng && { lng: data.lng }),
      ...(data.status && { status: data.status }),
      ...(data.checkInTime && { checkInTime: data.checkInTime }),
      ...(data.checkOutTime && { checkOutTime: data.checkOutTime }),
      ...(data.houseRules && { houseRules: data.houseRules }),
      ...(data.customRules && { customRules: data.customRules }),
      ...(data.cleaningFee && { cleaningFee: parseFloat(data.cleaningFee) }),
      ...(data.securityDeposit && { securityDeposit: parseFloat(data.securityDeposit) }),
      ...(data.bedrooms && { bedrooms: parseInt(data.bedrooms) }),
      ...(data.beds && { beds: parseInt(data.beds) }),
      ...(data.bathrooms && { bathrooms: parseInt(data.bathrooms) }),
      ...(data.maxGuests && { maxGuests: parseInt(data.maxGuests) }),
      ...(data.minimumStay && { minimumStay: parseInt(data.minimumStay) }),
      ...(data.maximumStay && { maximumStay: parseInt(data.maximumStay) }),
      ...(data.instantBooking && { instantBooking: data.instantBooking === 'true' || data.instantBooking === true }),
      ...(data.cancellationPolicy && { cancellationPolicy: data.cancellationPolicy }),
      updatedAt: new Date(),
    };

    const updatedProperty = await prisma.property.update({
      where: { id: params.id },
      data: updateData,
    });

    serverLogger.apiInfo('properties', 'Property updated successfully', {
      userId: userId,
      propertyId: params.id,
      status: data.status,
    });

    return NextResponse.json(updatedProperty);
  } catch (error) {
    serverLogger.apiError('property-update', 'Error updating property', {
      error: error.message,
      propertyId: params.id,
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    // Parse auth headers
    const authHeader = request.headers.get('Authorization');
    const userRole = request.headers.get('X-User-Role');
    const userId = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    // Debug auth data
    serverLogger.apiInfo('property-delete', 'Auth check in DELETE property request', { 
      propertyId: params.id,
      hasAuthHeader: !!authHeader,
      userId: userId || 'none',
      userRole: userRole || 'none',
    });
    
    // Check if user is authorized
    if (!userId || (userRole !== 'PROPERTY_MANAGER' && userRole !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const property = await prisma.property.findUnique({
      where: { id: params.id },
      select: { managerId: true },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Verify property ownership for property managers
    if (userRole === 'PROPERTY_MANAGER' && property.managerId !== userId) {
      return NextResponse.json({ error: 'Forbidden - You can only delete your own properties' }, { status: 403 });
    }

    await prisma.property.delete({
      where: { id: params.id },
    });

    serverLogger.apiInfo('properties', 'Property deleted successfully', {
      userId: userId,
      propertyId: params.id,
    });

    return NextResponse.json({ message: 'Property deleted successfully' });
  } catch (error) {
    serverLogger.apiError('property-delete', 'Error deleting property', {
      error: error.message,
      propertyId: params.id,
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 