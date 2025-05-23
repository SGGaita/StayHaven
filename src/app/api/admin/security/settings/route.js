import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import logger from '@/lib/server-logger';

// GET handler for fetching security settings
export async function GET() {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get security settings from database
    const settings = await prisma.settings.findFirst({
      where: {
        category: 'SECURITY',
      },
    });

    // Return default settings if none exist
    if (!settings) {
      const defaultSettings = {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          passwordExpiryDays: 90,
          preventPasswordReuse: true,
          passwordHistory: 5,
        },
        loginSecurity: {
          maxLoginAttempts: 5,
          lockoutDuration: 30,
          requireCaptcha: true,
          enable2FA: false,
          allowRememberMe: true,
          sessionTimeout: 60,
        },
        accountSecurity: {
          requireEmailVerification: true,
          allowPasswordReset: true,
          passwordResetExpiry: 24,
          requireStrongPasswords: true,
          enforceUniqueEmails: true,
          preventConcurrentSessions: false,
        },
      };

      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(settings.value);
  } catch (error) {
    logger.error('security-settings-get', 'Failed to fetch security settings', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT handler for updating security settings
export async function PUT(request) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();

    // Validate settings
    if (!data.passwordPolicy || !data.loginSecurity || !data.accountSecurity) {
      return NextResponse.json(
        { error: 'Invalid security settings format' },
        { status: 400 }
      );
    }

    // Update or create settings
    const settings = await prisma.settings.upsert({
      where: {
        category_key: {
          category: 'SECURITY',
          key: 'security_settings',
        },
      },
      update: {
        value: data,
        updatedBy: session.user.id,
      },
      create: {
        category: 'SECURITY',
        key: 'security_settings',
        value: data,
        description: 'System security settings and policies',
        createdBy: session.user.id,
      },
    });

    logger.info('security-settings-update', 'Security settings updated', {
      userId: session.user.id,
    });

    return NextResponse.json(settings.value);
  } catch (error) {
    logger.error('security-settings-update', 'Failed to update security settings', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 