import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';
import crypto from 'crypto';
import { validateEmail, logValidationError } from '@/lib/validation';
import { passwordResetLimiter, rateLimitMiddleware } from '@/lib/rateLimit';

// Helper function to hash reset token
const hashToken = (token) => {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
};

export async function POST(request) {
  try {
    // Check rate limit
    const rateLimitResponse = await rateLimitMiddleware(passwordResetLimiter)(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { email } = await request.json();
    logger.authInfo('forgot-password', 'Password reset request received', { email });

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      logValidationError('forgot-password', emailValidation.error, { email });
      return NextResponse.json(
        { message: 'If an account exists with this email, you will receive a password reset link' },
        { status: 200 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      logger.authWarn('forgot-password', 'Password reset requested for non-existent user', { email });
      return NextResponse.json(
        { message: 'If an account exists with this email, you will receive a password reset link' },
        { status: 200 }
      );
    }

    // Generate reset token and hash it
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = hashToken(resetToken);
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store hashed reset token
    await prisma.passwordReset.upsert({
      where: { userId: user.id },
      update: {
        token: hashedToken,
        expiresAt: tokenExpiry
      },
      create: {
        userId: user.id,
        token: hashedToken,
        expiresAt: tokenExpiry
      }
    });

    logger.authInfo('forgot-password', 'Password reset token generated', { email });

    // In a real application, send email with reset link using the unhashed resetToken
    // The unhashed resetToken would be included in the reset URL sent to the user's email
    // When the user clicks the link, they'll submit the unhashed token which we'll hash and compare

    return NextResponse.json({
      message: 'If an account exists with this email, you will receive a password reset link'
    });
  } catch (error) {
    logger.authError('forgot-password', 'Error processing password reset request', {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 