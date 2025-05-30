import { NextResponse } from 'next/server';
import { getUserFromHeaders } from '@/lib/auth-helpers';
import prisma from '@/lib/prisma';

export async function PUT(request) {
  try {
    // Get the current user from session
    const currentUser = await getUserFromHeaders(request);
    
    if (!currentUser || !currentUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to update privacy settings' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      profileVisibility,
      showEmail,
      showPhone,
      allowMessagesFromHosts,
      allowReviewsFromGuests,
    } = body;

    // Get current profile info to merge with new privacy settings
    const currentUserData = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { profileInfo: true }
    });

    const currentProfileInfo = currentUserData?.profileInfo || {};

    // Prepare updated privacy settings
    const updatedSettings = {
      profileVisibility: profileVisibility || 'public',
      showEmail: Boolean(showEmail),
      showPhone: Boolean(showPhone),
      allowMessagesFromHosts: Boolean(allowMessagesFromHosts),
      allowReviewsFromGuests: Boolean(allowReviewsFromGuests),
    };

    // Update user's profile info with new privacy settings
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        profileInfo: {
          ...currentProfileInfo,
          ...updatedSettings,
        },
        updatedAt: new Date(),
      },
      select: {
        id: true,
        profileInfo: true,
      }
    });

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
      message: 'Privacy settings updated successfully'
    });

  } catch (error) {
    console.error('Privacy settings update error:', error);
    return NextResponse.json(
      { error: 'Failed to update privacy settings. Please try again later.' },
      { status: 500 }
    );
  }
} 