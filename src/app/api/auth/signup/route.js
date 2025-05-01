import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';
import { validateEmail, validatePassword, validateRole, validateRequiredFields, logValidationError } from '@/lib/validation';
import { authRateLimiter, rateLimitMiddleware } from '@/lib/rateLimit';

export async function POST(request) {
  try {
    // Check rate limit
    const rateLimitResponse = await rateLimitMiddleware(authRateLimiter)(request);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { firstName, lastName, email, password, role } = body;

    // Validate required fields
    const requiredFieldsValidation = validateRequiredFields({ firstName, lastName, email, password });
    if (!requiredFieldsValidation.isValid) {
      logValidationError('signup', requiredFieldsValidation.error, { email });
      return NextResponse.json(
        { error: requiredFieldsValidation.error },
        { status: 400 }
      );
    }

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      logValidationError('signup', emailValidation.error, { email });
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logger.warn('auth', 'Signup attempt with existing email', { email });
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      logValidationError('signup', passwordValidation.error, { email });
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Validate role if provided
    if (role) {
      const roleValidation = validateRole(role);
      if (!roleValidation.isValid) {
        logValidationError('signup', roleValidation.error, { email, role });
        return NextResponse.json(
          { error: roleValidation.error },
          { status: 400 }
        );
      }
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
        role: role || 'CUSTOMER', // Default to CUSTOMER if no role specified
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.info('auth', 'User signup successful', {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      user: userWithoutPassword,
      message: 'User created successfully'
    }, { status: 201 });

  } catch (error) {
    logger.error('auth', 'Signup error', { error: error.message });
    return NextResponse.json(
      { error: 'An error occurred during sign up' },
      { status: 500 }
    );
  }
} 