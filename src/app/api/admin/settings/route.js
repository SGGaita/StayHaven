import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all settings
    const settingsData = await prisma.settings.findMany();

    // Transform settings into structured format
    const settings = {
      general: {
        siteName: '',
        siteDescription: '',
        maintenanceMode: false,
        allowRegistration: true,
        requireEmailVerification: true,
      },
      booking: {
        minBookingDays: 1,
        maxBookingDays: 30,
        allowInstantBooking: true,
        cancellationPeriod: 24,
        autoApproveBookings: false,
      },
      payment: {
        currency: 'USD',
        serviceFeePercentage: 10,
        minimumPayout: 100,
        payoutSchedule: 'WEEKLY',
      },
      email: {
        fromName: '',
        fromEmail: '',
        smtpHost: '',
        smtpPort: '',
        smtpUsername: '',
        smtpPassword: '',
        enableEmailNotifications: true,
      },
      security: {
        maxLoginAttempts: 5,
        lockoutDuration: 30,
        passwordExpiryDays: 90,
        requireStrongPasswords: true,
        enable2FA: false,
      },
    };

    // Merge saved settings with default settings
    settingsData.forEach(setting => {
      const [category, key] = setting.key.split('.');
      if (settings[category] && typeof settings[category][key] !== 'undefined') {
        settings[category][key] = setting.value;
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error in admin settings GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { key, value, description, category } = body;

    if (!key || !value || !category) {
      return NextResponse.json(
        { error: 'Key, value, and category are required' },
        { status: 400 }
      );
    }

    // Create setting
    const setting = await prisma.settings.create({
      data: {
        key,
        value,
        description,
        category,
      },
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error in admin settings POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const { section, settings: sectionSettings } = body;

    if (!section || !sectionSettings) {
      return NextResponse.json(
        { error: 'Section and settings are required' },
        { status: 400 }
      );
    }

    // Update each setting in the section
    const updates = Object.entries(sectionSettings).map(([key, value]) => {
      return prisma.settings.upsert({
        where: {
          key: `${section}.${key}`,
        },
        update: {
          value: value,
        },
        create: {
          key: `${section}.${key}`,
          value: value,
          category: section,
        },
      });
    });

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in admin settings PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Setting ID is required' },
        { status: 400 }
      );
    }

    // Delete setting
    await prisma.settings.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in admin settings DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 