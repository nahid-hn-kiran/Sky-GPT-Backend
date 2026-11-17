import { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../lib/auth';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    [key: string]: any;
  };
  session?: any;
}

/**
 * Middleware to require a valid authenticated session from Better Auth.
 * Reads cookies or Bearer token automatically.
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required. Please sign in.',
      });
    }

    req.user = session.user as any;
    req.session = session.session;
    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: err.message || 'Invalid or expired session',
    });
  }
}

/**
 * Role-based access control (RBAC) middleware.
 * Verifies that the authenticated user matches the specified role.
 */
export function requireRole(requiredRole: 'admin' | 'user') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Access denied. This action requires '${requiredRole}' privileges.`,
      });
    }

    next();
  };
}
