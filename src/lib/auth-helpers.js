import { cookies } from 'next/headers';
import { getToken } from 'next-auth/jwt';
import serverLogger from './server-logger';

/**
 * Get user information from request headers
 * This is used for APIs when you can't use getServerSession
 */
export async function getUserFromHeaders(request) {
  try {
    // Try to get the token from the request using next-auth
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (token) {
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
    
    // If we have both user ID and role in headers, use them
    if (userId && userRole) {
      return {
        id: userId,
        role: userRole,
      };
    }
    
    // If neither method works, return null
    return null;
  } catch (error) {
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