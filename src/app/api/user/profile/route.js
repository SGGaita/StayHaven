import { NextResponse } from 'next/server';
import { getUserFromHeaders } from '@/lib/auth-helpers';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  try {
    // Get the current user from session
    const currentUser = await getUserFromHeaders(request);
    
    if (!currentUser || !currentUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to access your profile' },
        { status: 401 }
      );
    }

    // Fetch user data with profile info
    const userData = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        profileInfo: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return the user data with flattened profile info
    const responseUser = {
      ...userData,
      phone: userData.profileInfo?.phone || null,
      bio: userData.profileInfo?.bio || null,
      avatar: userData.profileInfo?.avatar || null,
    };

    return NextResponse.json({
      success: true,
      user: responseUser
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile data. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // Get the current user from session
    const currentUser = await getUserFromHeaders(request);
    
    if (!currentUser || !currentUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to update your profile' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, bio } = body;

    // Basic validation
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Phone validation (if provided)
    if (phone && phone.length > 0) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        return NextResponse.json(
          { error: 'Please provide a valid phone number' },
          { status: 400 }
        );
      }
    }

    // Check if email is already taken by another user
    if (email !== currentUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
      });

      if (existingUser && existingUser.id !== currentUser.id) {
        return NextResponse.json(
          { error: 'Email address is already in use by another account' },
          { status: 400 }
        );
      }
    }

    // Get current profile info to merge with new data
    const currentUserData = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { profileInfo: true }
    });

    const currentProfileInfo = currentUserData?.profileInfo || {};

    // Prepare the updated profile info
    const updatedProfileInfo = {
      ...currentProfileInfo,
      phone: phone || null,
      bio: bio || null,
    };

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        firstName,
        lastName,
        email,
        profileInfo: updatedProfileInfo,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        profileInfo: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    // Return the updated user data with flattened profile info
    const responseUser = {
      ...updatedUser,
      phone: updatedUser.profileInfo?.phone || null,
      bio: updatedUser.profileInfo?.bio || null,
      avatar: updatedUser.profileInfo?.avatar || null,
    };

    return NextResponse.json({
      success: true,
      user: responseUser,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email address is already in use' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update profile. Please try again later.' },
      { status: 500 }
    );
  }
} 