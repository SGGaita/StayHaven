import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = [
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/admin/login',
    '/',
    '/properties',
  ];

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    pathname.startsWith(path) || pathname.startsWith('/api/auth')
  );

  // Allow access to public paths and API routes without any redirects
  if (isPublicPath || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (token && (pathname.startsWith('/auth/') || pathname === '/admin/login')) {
    if (token.role === 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect all other routes
  if (!token && !isPublicPath) {
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Role-based access control
  if (pathname.startsWith('/admin') && token?.role !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname.startsWith('/property-manager') && token?.role !== 'PROPERTY_MANAGER') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next/* (Next.js internals)
     * 2. /fonts/* (inside public directory)
     * 3. /images/* (inside public directory)
     * 4. /favicon.ico, /site.webmanifest (static files)
     */
    '/((?!_next|fonts|images|favicon.ico|site.webmanifest).*)',
  ],
}; 