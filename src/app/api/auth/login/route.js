import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    logger.authInfo('login', 'Login attempt for email', { email });

    // Validate input
    if (!email || !password) {
      logger.authWarn('login', 'Missing required fields', {
        email: !!email,
        password: !!password
      });
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      logger.authWarn('login', 'Login failed: User not found', { email });
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      logger.authWarn('login', 'Login failed: Invalid credentials', { email });
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.authInfo('login', 'Login successful for user', {
      email: user.email,
      userId: user.id,
      role: user.role
    });

    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
    });
  } catch (error) {
    logger.authError('login', 'Login error', {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 