import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/cms/navigation
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const navigation = await prisma.navigation.findFirst({
      where: { name: 'Main Navigation' },
    });

    return NextResponse.json(navigation || { name: 'Main Navigation', items: [], logo: null });
  } catch (error) {
    console.error('Error fetching navigation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/admin/cms/navigation
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const navigation = await prisma.navigation.upsert({
      where: { name: 'Main Navigation' },
      update: {
        items: data.items,
        logo: data.logo,
      },
      create: {
        name: 'Main Navigation',
        items: data.items,
        logo: data.logo,
      },
    });

    return NextResponse.json(navigation);
  } catch (error) {
    console.error('Error updating navigation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 