import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import logger from '@/lib/server-logger';

// PATCH handler for updating a specific user
export async function PATCH(request, { params }) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !['ADMIN', 'SUPER_ADMIN'].includes(token.role)) {
      logger.authError('unauthorized-access', 'Unauthorized user update attempt', {
        userId: token?.id,
        role: token?.role
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const updateData = await request.json();

    logger.apiDebug('admin-user-update', 'Updating specific user', {
      adminId: token.id,
      userId: id,
      updateData: { ...updateData, password: undefined }
    });

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        verificationStatus: true,
        updatedAt: true,
      },
    });

    logger.adminInfo('user-updated', 'User updated successfully', {
      adminId: token.id,
      userId: user.id,
      updatedFields: Object.keys(updateData)
    });

    return NextResponse.json(user);
  } catch (error) {
    logger.apiError('admin-user-update', 'Failed to update user', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting a specific user
export async function DELETE(request, { params }) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !['ADMIN', 'SUPER_ADMIN'].includes(token.role)) {
      logger.authError('unauthorized-access', 'Unauthorized user deletion attempt', {
        userId: token?.id,
        role: token?.role
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    logger.apiDebug('admin-user-delete', 'Deleting specific user', {
      adminId: token.id,
      userId: id
    });

    await prisma.user.delete({
      where: { id },
    });

    logger.adminInfo('user-deleted', 'User deleted successfully', {
      adminId: token.id,
      deletedUserId: id
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.apiError('admin-user-delete', 'Failed to delete user', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 