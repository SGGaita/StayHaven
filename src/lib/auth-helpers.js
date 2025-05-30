import { getToken } from 'next-auth/jwt';
import serverLogger from './server-logger';

/**
 * Get user information from request headers
 * This is used for APIs when you can't use getServerSession
 */
export async function getUserFromHeaders(request) {
  try {
    console.log('[AUTH] getUserFromHeaders called');
    
    // Check for custom auth cookie FIRST (used by the main app) - read directly from request headers
    const cookieHeader = request.headers.get('cookie');
    console.log('[AUTH] Cookie header:', cookieHeader ? 'found' : 'not found');
    
    if (cookieHeader) {
      // Parse cookies manually
      const cookies = {};
      cookieHeader.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          cookies[name] = decodeURIComponent(value);
        }
      });
      
      console.log('[AUTH] Available cookies:', Object.keys(cookies));
      const authCookieValue = cookies['auth'];
      
      if (authCookieValue) {
        try {
          console.log('[AUTH] Auth cookie value found, parsing...');
          const sessionData = JSON.parse(authCookieValue);
          console.log('[AUTH] Parsed session data:', {
            isAuthenticated: sessionData?.isAuthenticated,
            hasUser: !!sessionData?.user,
            userId: sessionData?.user?.id,
            userEmail: sessionData?.user?.email
          });
          
          // Check if we have valid session data with user info
          if (sessionData && sessionData.isAuthenticated && sessionData.user) {
            console.log('[AUTH] Using custom auth cookie for user:', sessionData.user.email);
            return {
              id: sessionData.user.id,
              email: sessionData.user.email,
              role: sessionData.user.role,
              firstName: sessionData.user.firstName,
              lastName: sessionData.user.lastName,
            };
          }
        } catch (cookieParseError) {
          console.error('[AUTH] Error parsing auth cookie:', cookieParseError.message);
          serverLogger.error('auth-helpers', 'Error parsing auth cookie', {
            error: cookieParseError.message,
          });
        }
      }
    }
    
    // Fallback to NextAuth token if custom auth cookie is not found or invalid
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    console.log('[AUTH] NextAuth token:', token ? 'found' : 'not found');
    
    if (token) {
      console.log('[AUTH] Using NextAuth token for user:', token.email);
      return {
        id: token.id,
        email: token.email,
        role: token.role,
        firstName: token.firstName,
        lastName: token.lastName,
      };
    }
    
    // If next-auth token not found, check for custom Bearer token in headers
    const authHeader = request.headers.get('Authorization');
    const userRole = request.headers.get('X-User-Role');
    const userId = authHeader ? authHeader.replace('Bearer ', '') : null;
    console.log('[AUTH] Headers - Authorization:', !!authHeader, 'X-User-Role:', userRole);
    
    // If we have both user ID and role in headers, use them
    if (userId && userRole) {
      console.log('[AUTH] Using header-based auth for user:', userId);
      return {
        id: userId,
        role: userRole,
      };
    }
    
    // If neither method works, return null
    console.log('[AUTH] No valid authentication found');
    return null;
  } catch (error) {
    console.error('[AUTH] Error getting user from headers:', error.message);
    serverLogger.error('auth-helpers', 'Error getting user from headers', {
      error: error.message,
    });
    return null;
  }
}

/**
 * Check if a user is authorized to perform an action
 */
export function isAuthorized(user, requiredRoles = null) {
  if (!user) return false;
  
  // If no specific roles required, just check that the user exists
  if (!requiredRoles) return true;
  
  // Check if user has one of the required roles
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(user.role);
}

/**
 * Check if a property manager owns a property
 */
export function ownsProperty(user, property) {
  if (!user || !property) return false;
  
  // Admins have access to all properties
  if (user.role === 'SUPER_ADMIN') return true;
  
  // Property managers can only access their own properties
  if (user.role === 'PROPERTY_MANAGER') {
    return property.managerId === user.id;
  }
  
  return false;
} 