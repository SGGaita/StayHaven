import { NextResponse } from 'next/server';
import { getUserFromHeaders } from '@/lib/auth-helpers';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(request) {
  try {
    // Get the current user from session
    const currentUser = await getUserFromHeaders(request);
    
    if (!currentUser || !currentUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to change your password' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Basic validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Password strength validation
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if new password has at least one number and one letter
    const hasNumber = /\d/.test(newPassword);
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    
    if (!hasNumber || !hasLetter) {
      return NextResponse.json(
        { error: 'New password must contain at least one letter and one number' },
        { status: 400 }
      );
    }

    // Fetch user's current password hash from database
    const userData = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { 
        id: true,
        password: true 
      }
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userData.password);
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'Failed to change password. Please try again later.' },
      { status: 500 }
    );
  }
} 