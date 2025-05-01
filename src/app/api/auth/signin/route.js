import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import logger from '@/lib/server-logger';
import { validateEmail, validateRequiredFields, logValidationError } from '@/lib/validation';
import { authRateLimiter, rateLimitMiddleware } from '@/lib/rateLimit';

export async function POST(request) {
  try {
    // Check rate limit
    const rateLimitResponse = await rateLimitMiddleware(authRateLimiter)(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { email, password } = await request.json();

    // Validate required fields
    const requiredFieldsValidation = validateRequiredFields({ email, password });
    if (!requiredFieldsValidation.isValid) {
      logger.authError('signin-validation', requiredFieldsValidation.error);
      return NextResponse.json(
        { error: requiredFieldsValidation.error },
        { status: 400 }
      );
    }

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      logger.authError('signin-validation', emailValidation.error, { email });
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      logger.authWarn('signin', 'Invalid credentials', { email });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      logger.authWarn('signin', 'Invalid credentials', { email });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Remove sensitive data before sending response
    const { password: _, ...userWithoutPassword } = user;

    logger.authInfo('signin', 'User signed in successfully', {
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({
      user: userWithoutPassword,
    });
  } catch (error) {
    logger.authError('signin', 'Error during sign in', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: 'An error occurred during sign in' },
      { status: 500 }
    );
  }
} 