import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    // Get the token with the secret
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      console.warn('[AUTH] verify-admin: No token found in request');
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    console.info('[AUTH] Verifying admin status for user:', token.id);

    // Check if the user has the SUPER_ADMIN role
    const isAdmin = token.role === 'SUPER_ADMIN';

    if (!isAdmin) {
      console.warn('[AUTH] Non-admin access attempt:', { 
        userId: token.id,
        role: token.role 
      });
    }

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('[AUTH] Error verifying admin status:', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: 'Internal Server Error', isAdmin: false },
      { status: 500 }
    );
  }
}