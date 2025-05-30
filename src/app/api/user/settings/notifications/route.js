import { NextResponse } from 'next/server';
import { getUserFromHeaders } from '@/lib/auth-helpers';
import prisma from '@/lib/prisma';

export async function PUT(request) {
  try {
    // Get the current user from session
    const currentUser = await getUserFromHeaders(request);
    
    if (!currentUser || !currentUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to update notification settings' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      emailBookingConfirmation,
      emailPromotions,
      pushNotifications,
      smsUpdates,
      weeklyNewsletter,
    } = body;

    // Get current profile info to merge with new notification settings
    const currentUserData = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { profileInfo: true }
    });

    const currentProfileInfo = currentUserData?.profileInfo || {};

    // Prepare updated notification settings
    const updatedSettings = {
      emailBookingConfirmation: Boolean(emailBookingConfirmation),
      emailPromotions: Boolean(emailPromotions),
      pushNotifications: Boolean(pushNotifications),
      smsUpdates: Boolean(smsUpdates),
      weeklyNewsletter: Boolean(weeklyNewsletter),
    };

    // Update user's profile info with new notification settings
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
      message: 'Notification settings updated successfully'
    });

  } catch (error) {
    console.error('Notification settings update error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification settings. Please try again later.' },
      { status: 500 }
    );
  }
} 