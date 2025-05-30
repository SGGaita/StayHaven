import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getUserFromHeaders } from '@/lib/auth-helpers';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    // Get the current user from session
    const currentUser = await getUserFromHeaders(request);
    
    if (!currentUser || !currentUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to upload an avatar' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('avatar');

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Please upload a valid image file' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory already exists or other error, continue
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const uniqueName = `avatar-${currentUser.id}-${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadsDir, uniqueName);

    // Write file to uploads directory
    await writeFile(filePath, buffer);

    // Generate public URL
    const avatarUrl = `/uploads/avatars/${uniqueName}`;

    // Get current profile info to merge with new avatar URL
    const currentUserData = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { profileInfo: true }
    });

    const currentProfileInfo = currentUserData?.profileInfo || {};

    // Update user's profile info with new avatar URL
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        profileInfo: {
          ...currentProfileInfo,
          avatar: avatarUrl,
        },
        updatedAt: new Date(),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileInfo: true,
      }
    });

    return NextResponse.json({
      success: true,
      avatarUrl,
      user: {
        ...updatedUser,
        avatar: avatarUrl,
        phone: updatedUser.profileInfo?.phone || null,
        bio: updatedUser.profileInfo?.bio || null,
      },
      message: 'Avatar uploaded successfully'
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload avatar. Please try again later.' },
      { status: 500 }
    );
  }
} 