import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import logger from '@/lib/logger';

export async function GET(request) {
  try {
    // Get the token with the secret
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      logger.authWarn('verify-admin', 'No token found in request');
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    logger.info('auth', 'Verifying admin status', { userId: token.id });

    // Check if the user has the SUPER_ADMIN role
    const isAdmin = token.role === 'SUPER_ADMIN';

    if (!isAdmin) {
      logger.authWarn('verify-admin', 'Non-admin access attempt', { 
        userId: token.id,
        role: token.role 
      });
    }

    return NextResponse.json({ isAdmin });
  } catch (error) {
    logger.error('auth', 'Error verifying admin status', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: 'Internal Server Error', isAdmin: false },
      { status: 500 }
    );
  }
} 