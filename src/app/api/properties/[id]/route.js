import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

export async function GET(request, { params }) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        reviews: {
          include: {
            customer: {
              select: {
                firstName: true,
                lastName: true,
                profileInfo: true,
              },
            },
          },
        },
        manager: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            profileInfo: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Calculate average rating
    const avgRating =
      property.reviews.length > 0
        ? property.reviews.reduce((acc, review) => acc + review.rating, 0) /
          property.reviews.length
        : null;

    // Check if the user has permission to view detailed information
    const isAuthorized =
      token.role === 'SUPER_ADMIN' ||
      (token.role === 'PROPERTY_MANAGER' && property.managerId === token.id);

    // Remove sensitive information for non-authorized users
    if (!isAuthorized) {
      delete property.manager.email;
      property.manager.profileInfo = {};
    }

    logger.info('properties', 'Property fetched successfully', {
      userId: token.id,
      propertyId: params.id,
    });

    return NextResponse.json({
      ...property,
      avgRating,
    });
  } catch (error) {
    logger.error('properties', 'Error fetching property', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const token = await getToken({ req: request });
    if (!token || (token.role !== 'PROPERTY_MANAGER' && token.role !== 'SUPER_ADMIN')) {
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
    if (token.role === 'PROPERTY_MANAGER' && property.managerId !== token.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
      ...(data.price && { price: data.price }),
      ...(data.lat && { lat: data.lat }),
      ...(data.lng && { lng: data.lng }),
      ...(data.status && { status: data.status }),
    };

    const updatedProperty = await prisma.property.update({
      where: { id: params.id },
      data: updateData,
    });

    logger.info('properties', 'Property updated successfully', {
      userId: token.id,
      propertyId: params.id,
      status: data.status,
    });

    return NextResponse.json(updatedProperty);
  } catch (error) {
    logger.error('properties', 'Error updating property', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = await getToken({ req: request });
    if (!token || (token.role !== 'PROPERTY_MANAGER' && token.role !== 'SUPER_ADMIN')) {
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
    if (token.role === 'PROPERTY_MANAGER' && property.managerId !== token.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.property.delete({
      where: { id: params.id },
    });

    logger.info('properties', 'Property deleted successfully', {
      userId: token.id,
      propertyId: params.id,
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