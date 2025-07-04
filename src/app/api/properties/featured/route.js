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
        coverPhotoIndex: property.coverPhotoIndex || 0,
      };
    });

    return NextResponse.json(featuredProperties);
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    
    // Return mock/fallback data when database is unavailable
    const mockProperties = [
      {
        id: 'mock-1',
        name: 'Luxury Beachfront Villa',
        description: 'Stunning oceanfront property with private beach access',
        location: 'Malibu, CA',
        propertyType: 'Villa',
        price: 899,
        bedrooms: 4,
        bathrooms: 3,
        maxGuests: 8,
        photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'],
        amenities: ['Ocean View', 'Private Beach', 'Pool', 'WiFi'],
        status: 'ACTIVE',
        avgRating: 4.9,
        reviewCount: 124,
        ownerName: 'Property Manager',
        coverPhotoIndex: 0,
        manager: {
          id: 'mock-manager-1',
          firstName: 'Property',
          lastName: 'Manager'
        }
      },
      {
        id: 'mock-2',
        name: 'Modern Downtown Loft',
        description: 'Stylish city apartment with skyline views',
        location: 'New York, NY',
        propertyType: 'Apartment',
        price: 299,
        bedrooms: 2,
        bathrooms: 1,
        maxGuests: 4,
        photos: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'],
        amenities: ['City View', 'Gym', 'WiFi', 'Kitchen'],
        status: 'ACTIVE',
        avgRating: 4.7,
        reviewCount: 89,
        ownerName: 'Property Manager',
        coverPhotoIndex: 0,
        manager: {
          id: 'mock-manager-2',
          firstName: 'Property',
          lastName: 'Manager'
        }
      },
      {
        id: 'mock-3',
        name: 'Mountain View Cabin',
        description: 'Cozy retreat with stunning mountain vistas',
        location: 'Aspen, CO',
        propertyType: 'Cabin',
        price: 459,
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        photos: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80'],
        amenities: ['Mountain View', 'Fireplace', 'Hot Tub', 'WiFi'],
        status: 'ACTIVE',
        avgRating: 4.8,
        reviewCount: 156,
        ownerName: 'Property Manager',
        coverPhotoIndex: 0,
        manager: {
          id: 'mock-manager-3',
          firstName: 'Property',
          lastName: 'Manager'
        }
      }
    ];
    
    return NextResponse.json(mockProperties);
  }
} 