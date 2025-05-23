import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';
import crypto from 'crypto';
import { validatePassword, validateRequiredFields, logValidationError } from '@/lib/validation';
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

    const { token, password } = await request.json();

    // Validate required fields
    const requiredFieldsValidation = validateRequiredFields({ token, password });
    if (!requiredFieldsValidation.isValid) {
      logValidationError('reset-password', requiredFieldsValidation.error);
      return NextResponse.json(
        { message: requiredFieldsValidation.error },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      logValidationError('reset-password', passwordValidation.error);
      return NextResponse.json(
        { message: passwordValidation.error },
        { status: 400 }
      );
    }

    // Hash the provided token for comparison
    const hashedToken = hashToken(token);

    // Find valid reset token
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        token: hashedToken,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    });

    if (!resetRecord) {
      logger.authWarn('reset-password', 'Invalid or expired reset token');
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user's password
    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword }
    });

    // Delete used reset token
    await prisma.passwordReset.delete({
      where: { id: resetRecord.id }
    });

    logger.authInfo('reset-password', 'Password reset successful', { 
      email: resetRecord.user.email 
    });

    return NextResponse.json({
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    logger.authError('reset-password', 'Error processing password reset', {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 