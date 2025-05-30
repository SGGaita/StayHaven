import { NextResponse } from 'next/server';
import { getUserFromHeaders } from '@/lib/auth-helpers';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    // Get the current user from session
    const currentUser = await getUserFromHeaders(request);
    
    if (!currentUser || !currentUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to access settings' },
        { status: 401 }
      );
    }

    // Fetch user data with profile info
    const userData = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { 
        profileInfo: true 
      }
    });

    const profileInfo = userData?.profileInfo || {};

    // Extract settings from profile info with defaults
    const userSettings = {
      notifications: {
        emailBookingConfirmation: profileInfo.emailBookingConfirmation ?? true,
        emailPromotions: profileInfo.emailPromotions ?? true,
        pushNotifications: profileInfo.pushNotifications ?? true,
        smsUpdates: profileInfo.smsUpdates ?? false,
        weeklyNewsletter: profileInfo.weeklyNewsletter ?? true,
      },
      privacy: {
        profileVisibility: profileInfo.profileVisibility ?? 'public',
        showEmail: profileInfo.showEmail ?? false,
        showPhone: profileInfo.showPhone ?? false,
        allowMessagesFromHosts: profileInfo.allowMessagesFromHosts ?? true,
        allowReviewsFromGuests: profileInfo.allowReviewsFromGuests ?? true,
      },
    };

    return NextResponse.json(userSettings);

  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user settings' },
      { status: 500 }
    );
  }
} 