import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import logger from '@/lib/server-logger';

// GET handler for fetching email templates
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

    // Get all email templates
    const templates = await prisma.emailTemplate.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(templates);
  } catch (error) {
    logger.error('email-templates-get', 'Failed to fetch email templates', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST handler for creating a new email template
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

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.subject || !data.content) {
      return NextResponse.json(
        { error: 'Name, subject, and content are required' },
        { status: 400 }
      );
    }

    // Create new template
    const template = await prisma.emailTemplate.create({
      data: {
        name: data.name,
        subject: data.subject,
        content: data.content,
        variables: data.variables || [],
        createdBy: session.user.id,
      },
    });

    logger.info('email-template-create', 'Email template created', {
      templateId: template.id,
      name: template.name,
      userId: session.user.id,
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    logger.error('email-template-create', 'Failed to create email template', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT handler for updating an email template
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

    // Validate required fields
    if (!data.id || !data.name || !data.subject || !data.content) {
      return NextResponse.json(
        { error: 'ID, name, subject, and content are required' },
        { status: 400 }
      );
    }

    // Update template
    const template = await prisma.emailTemplate.update({
      where: { id: data.id },
      data: {
        name: data.name,
        subject: data.subject,
        content: data.content,
        variables: data.variables || [],
        updatedBy: session.user.id,
      },
    });

    logger.info('email-template-update', 'Email template updated', {
      templateId: template.id,
      name: template.name,
      userId: session.user.id,
    });

    return NextResponse.json(template);
  } catch (error) {
    logger.error('email-template-update', 'Failed to update email template', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting an email template
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
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Delete template
    await prisma.emailTemplate.delete({
      where: { id },
    });

    logger.info('email-template-delete', 'Email template deleted', {
      templateId: id,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('email-template-delete', 'Failed to delete email template', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 