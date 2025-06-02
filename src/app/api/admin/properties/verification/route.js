import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Mock data for demonstration - replace with actual database queries
const mockProperties = [
  {
    id: 1,
    name: 'Luxury Downtown Apartment',
    location: 'New York, NY',
    propertyType: 'Apartment',
    description: 'A beautiful luxury apartment in the heart of downtown with stunning city views.',
    photos: ['/placeholder-property.jpg', '/placeholder-property-2.jpg'],
    pricePerNight: 250,
    rating: 4.8,
    reviewCount: 24,
    manager: { 
      id: 1,
      firstName: 'John', 
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123'
    },
    verificationStatus: 'PENDING',
    submittedAt: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-15T10:30:00Z',
    verificationChecks: {},
    amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'Parking'],
    capacity: 4,
    bedrooms: 2,
    bathrooms: 2,
  },
  {
    id: 2,
    name: 'Cozy Beach House',
    location: 'Miami, FL',
    propertyType: 'House',
    description: 'A charming beach house just steps away from the ocean with private beach access.',
    photos: ['/placeholder-property.jpg'],
    pricePerNight: 180,
    rating: 4.6,
    reviewCount: 18,
    manager: { 
      id: 2,
      firstName: 'Jane', 
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0456'
    },
    verificationStatus: 'IN_REVIEW',
    submittedAt: '2024-01-14T14:20:00Z',
    createdAt: '2024-01-14T14:20:00Z',
    verificationChecks: {
      'basic_info_property_name': true,
      'basic_info_property_type': true,
      'basic_info_location_accurate': true,
      'photos_photo_quality': true,
      'photos_photo_accuracy': true,
    },
    amenities: ['WiFi', 'Beach Access', 'BBQ Grill', 'Outdoor Shower'],
    capacity: 6,
    bedrooms: 3,
    bathrooms: 2,
  },
  {
    id: 3,
    name: 'Mountain Cabin Retreat',
    location: 'Aspen, CO',
    propertyType: 'Cabin',
    description: 'A rustic mountain cabin perfect for winter sports and summer hiking adventures.',
    photos: ['/placeholder-property.jpg'],
    pricePerNight: 320,
    rating: 4.9,
    reviewCount: 31,
    manager: { 
      id: 3,
      firstName: 'Mike', 
      lastName: 'Johnson',
      email: 'mike.johnson@example.com',
      phone: '+1-555-0789'
    },
    verificationStatus: 'NEEDS_REVISION',
    submittedAt: '2024-01-13T09:15:00Z',
    createdAt: '2024-01-13T09:15:00Z',
    verificationChecks: {
      'basic_info_property_name': true,
      'basic_info_property_type': true,
      'basic_info_location_accurate': false,
      'basic_info_description_complete': true,
      'photos_photo_quality': false,
    },
    amenities: ['Fireplace', 'Hot Tub', 'Ski Storage', 'Mountain Views'],
    capacity: 8,
    bedrooms: 4,
    bathrooms: 3,
  },
  {
    id: 4,
    name: 'Urban Loft Studio',
    location: 'San Francisco, CA',
    propertyType: 'Apartment',
    description: 'Modern loft studio in the trendy SOMA district with industrial design elements.',
    photos: ['/placeholder-property.jpg'],
    pricePerNight: 195,
    rating: 4.4,
    reviewCount: 12,
    manager: { 
      id: 4,
      firstName: 'Sarah', 
      lastName: 'Wilson',
      email: 'sarah.wilson@example.com',
      phone: '+1-555-0321'
    },
    verificationStatus: 'VERIFIED',
    submittedAt: '2024-01-12T16:45:00Z',
    createdAt: '2024-01-12T16:45:00Z',
    verificationChecks: {
      'basic_info_property_name': true,
      'basic_info_property_type': true,
      'basic_info_location_accurate': true,
      'basic_info_description_complete': true,
      'basic_info_contact_info': true,
      'photos_photo_quality': true,
      'photos_photo_accuracy': true,
      'photos_photo_coverage': true,
      'amenities_amenities_accurate': true,
      'amenities_capacity_accurate': true,
      'pricing_pricing_reasonable': true,
      'pricing_pricing_transparent': true,
      'pricing_cancellation_policy': true,
      'pricing_house_rules': true,
      'legal_business_license': true,
      'legal_rental_permit': true,
      'legal_tax_compliance': true,
      'legal_insurance': true,
      'legal_zoning_compliance': true,
      'safety_smoke_detectors': true,
      'safety_carbon_monoxide': true,
      'safety_fire_extinguisher': true,
      'safety_emergency_exits': true,
    },
    amenities: ['WiFi', 'Workspace', 'Gym Access', 'Rooftop Terrace'],
    capacity: 2,
    bedrooms: 1,
    bathrooms: 1,
  },
];

// Authentication helper
async function authenticateAdmin(request) {
  try {
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth');
    
    if (!authCookie) {
      return { error: 'No authentication cookie found', status: 401 };
    }

    let session;
    try {
      session = JSON.parse(authCookie.value);
    } catch (parseError) {
      console.error('Error parsing auth cookie:', parseError);
      return { error: 'Invalid authentication cookie', status: 401 };
    }

    if (!session || !session.user || !session.user.id) {
      return { error: 'Invalid session data', status: 401 };
    }

    if (!session.isAuthenticated) {
      return { error: 'User not authenticated', status: 401 };
    }

    // Check if user has admin privileges
    const userRole = session.user.role;
    if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      return { error: 'Insufficient permissions. Admin access required.', status: 403 };
    }

    return { user: session.user };
  } catch (error) {
    console.error('Authentication error:', error);
    return { error: 'Authentication failed', status: 500 };
  }
}

// GET - Fetch properties for verification
export async function GET(request) {
  try {
    const authResult = await authenticateAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'ALL';

    // Filter properties based on search and status
    let filteredProperties = mockProperties;

    if (search) {
      filteredProperties = filteredProperties.filter(property =>
        property.name.toLowerCase().includes(search.toLowerCase()) ||
        property.location.toLowerCase().includes(search.toLowerCase()) ||
        `${property.manager.firstName} ${property.manager.lastName}`.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== 'ALL') {
      filteredProperties = filteredProperties.filter(property =>
        property.verificationStatus === status
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

    // Calculate statistics
    const stats = {
      total: mockProperties.length,
      pending: mockProperties.filter(p => p.verificationStatus === 'PENDING').length,
      inReview: mockProperties.filter(p => p.verificationStatus === 'IN_REVIEW').length,
      verified: mockProperties.filter(p => p.verificationStatus === 'VERIFIED').length,
      rejected: mockProperties.filter(p => p.verificationStatus === 'REJECTED').length,
      needsRevision: mockProperties.filter(p => p.verificationStatus === 'NEEDS_REVISION').length,
    };

    return NextResponse.json({
      properties: paginatedProperties,
      pagination: {
        page,
        limit,
        total: filteredProperties.length,
        totalPages: Math.ceil(filteredProperties.length / limit),
      },
      stats,
    });

  } catch (error) {
    console.error('Error fetching properties for verification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties for verification' },
      { status: 500 }
    );
  }
}

// POST - Update verification status or checks
export async function POST(request) {
  try {
    const authResult = await authenticateAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const { propertyId, action, verificationChecks, notes, reason } = body;

    if (!propertyId || !action) {
      return NextResponse.json(
        { error: 'Property ID and action are required' },
        { status: 400 }
      );
    }

    // Find the property
    const propertyIndex = mockProperties.findIndex(p => p.id === parseInt(propertyId));
    if (propertyIndex === -1) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const property = mockProperties[propertyIndex];

    // Handle different actions
    switch (action) {
      case 'verify':
        // Update verification status to verified
        mockProperties[propertyIndex] = {
          ...property,
          verificationStatus: 'VERIFIED',
          verificationChecks: verificationChecks || property.verificationChecks,
          verificationNotes: notes,
          verifiedAt: new Date().toISOString(),
          verifiedBy: authResult.user.id,
        };
        break;

      case 'reject':
        // Update verification status to rejected
        mockProperties[propertyIndex] = {
          ...property,
          verificationStatus: 'REJECTED',
          rejectionReason: reason,
          rejectionNotes: notes,
          rejectedAt: new Date().toISOString(),
          rejectedBy: authResult.user.id,
        };
        break;

      case 'request_revision':
        // Update verification status to needs revision
        mockProperties[propertyIndex] = {
          ...property,
          verificationStatus: 'NEEDS_REVISION',
          revisionNotes: notes,
          revisionRequestedAt: new Date().toISOString(),
          revisionRequestedBy: authResult.user.id,
        };
        break;

      case 'start_review':
        // Update verification status to in review
        mockProperties[propertyIndex] = {
          ...property,
          verificationStatus: 'IN_REVIEW',
          reviewStartedAt: new Date().toISOString(),
          reviewStartedBy: authResult.user.id,
        };
        break;

      case 'update_checks':
        // Update verification checks
        mockProperties[propertyIndex] = {
          ...property,
          verificationChecks: verificationChecks || property.verificationChecks,
          lastUpdatedAt: new Date().toISOString(),
          lastUpdatedBy: authResult.user.id,
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Property verification ${action} completed successfully`,
      property: mockProperties[propertyIndex],
    });

  } catch (error) {
    console.error('Error updating property verification:', error);
    return NextResponse.json(
      { error: 'Failed to update property verification' },
      { status: 500 }
    );
  }
}

// PUT - Bulk update verification status
export async function PUT(request) {
  try {
    const authResult = await authenticateAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const { propertyIds, action, notes } = body;

    if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
      return NextResponse.json(
        { error: 'Property IDs array is required' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    const updatedProperties = [];
    const errors = [];

    for (const propertyId of propertyIds) {
      const propertyIndex = mockProperties.findIndex(p => p.id === parseInt(propertyId));
      
      if (propertyIndex === -1) {
        errors.push(`Property ${propertyId} not found`);
        continue;
      }

      const property = mockProperties[propertyIndex];

      // Apply bulk action
      switch (action) {
        case 'bulk_verify':
          mockProperties[propertyIndex] = {
            ...property,
            verificationStatus: 'VERIFIED',
            verificationNotes: notes,
            verifiedAt: new Date().toISOString(),
            verifiedBy: authResult.user.id,
          };
          break;

        case 'bulk_reject':
          mockProperties[propertyIndex] = {
            ...property,
            verificationStatus: 'REJECTED',
            rejectionNotes: notes,
            rejectedAt: new Date().toISOString(),
            rejectedBy: authResult.user.id,
          };
          break;

        case 'bulk_start_review':
          mockProperties[propertyIndex] = {
            ...property,
            verificationStatus: 'IN_REVIEW',
            reviewStartedAt: new Date().toISOString(),
            reviewStartedBy: authResult.user.id,
          };
          break;

        default:
          errors.push(`Invalid action for property ${propertyId}`);
          continue;
      }

      updatedProperties.push(mockProperties[propertyIndex]);
    }

    return NextResponse.json({
      success: true,
      message: `Bulk ${action} completed`,
      updatedCount: updatedProperties.length,
      errors: errors.length > 0 ? errors : undefined,
      updatedProperties,
    });

  } catch (error) {
    console.error('Error performing bulk verification update:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk verification update' },
      { status: 500 }
    );
  }
} 