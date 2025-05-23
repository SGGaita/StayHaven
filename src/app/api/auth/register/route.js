import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

export async function POST(request) {
  try {
    const { firstName, lastName, email, password, role } = await request.json();
    logger.authInfo('register', 'Received registration request', { email, role });

    // Validate input
    if (!firstName || !lastName || !email || !password || !role) {
      logger.authWarn('register', 'Missing required fields', {
        firstName: !!firstName,
        lastName: !!lastName,
        email: !!email,
        password: !!password,
        role: !!role
      });
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logger.authWarn('register', 'User already exists', { email });
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.authInfo('register', 'User registered successfully', {
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return NextResponse.json(
      { message: 'User created successfully', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    logger.authError('register', 'Registration error', {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 