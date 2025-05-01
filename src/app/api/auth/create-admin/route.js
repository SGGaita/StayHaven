import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

export async function POST(request) {
  try {
    // Check if an admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'SUPER_ADMIN',
      },
    });

    if (existingAdmin) {
      logger.authWarn('create-admin', 'Admin creation attempted when admin already exists');
      return NextResponse.json(
        { message: 'An admin account already exists' },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password } = await request.json();

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      logger.authWarn('create-admin', 'Missing required fields for admin creation');
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logger.authWarn('create-admin', 'Admin creation attempted with existing email', { email });
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        verificationStatus: 'VERIFIED',
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.authInfo('create-admin', 'Admin account created successfully', {
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json(
      { message: 'Admin created successfully', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    logger.authError('create-admin', 'Error creating admin account', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 