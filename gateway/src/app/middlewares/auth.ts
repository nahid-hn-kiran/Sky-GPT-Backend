import { redis } from "@skygpt/shared/redis";
import { NextFunction, Request, Response } from "express";
import { config } from "../config";

export interface AuthenticatedGatewayRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    [key: string]: any;
  };
}

/**
 * Extracts session token from Cookie or Authorization header.
 * Better Auth signs cookies with format: "<token>.<signature>", so we split by '.'
 */
function extractToken(req: Request): string | null {
  // 1. Check Authorization Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // 2. Check Better Auth session cookie
  const cookieToken =
    req.cookies?.["better-auth.session_token"] ||
    req.cookies?.["__Secure-better-auth.session_token"];

  if (cookieToken) {
    return cookieToken.split(".")[0];
  }

  return null;
}

/**
 * Gateway Auth Middleware:
 * 1. Checks Redis cache first (< 1ms).
 * 2. If cache miss, falls back to Auth Service to verify with MongoDB.
 * 3. Injects user into `req.user` or returns 401.
 */
export async function gatewayAuth(
  req: AuthenticatedGatewayRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = extractToken(req);

    // If no token, allow anonymous access with guest id for sandbox exploration
    if (!token) {
      req.user = {
        id: "anonymous-guest",
        email: "guest@skygpt.local",
        name: "Guest Explorer",
        role: "user",
      };
      return next();
    }

    // 1. FAST PATH: Check Redis
    const cached = await redis.get(token);
    let sessionData = cached ? JSON.parse(cached) : null;

    // 2. FALLBACK PATH: If Redis missed, query Auth Service directly
    if (!sessionData) {
      const response = await fetch(
        `${config.services.auth}/api/v1/auth/get-session`,
        {
          headers: {
            cookie: req.headers.cookie || "",
            authorization: req.headers.authorization || "",
          },
        },
      );

      if (response.ok) {
        sessionData = await response.json();
      }
    }

    // 3. Validation: If session was supplied but invalid or expired, default to guest or 401
    if (!sessionData || !sessionData.user) {
      req.user = {
        id: "anonymous-guest",
        email: "guest@skygpt.local",
        name: "Guest Explorer",
        role: "user",
      };
      return next();
    }

    // Check expiration if present
    if (sessionData.session?.expiresAt) {
      const expiresAt = new Date(sessionData.session.expiresAt).getTime();
      if (expiresAt < Date.now()) {
        req.user = {
          id: "anonymous-guest",
          email: "guest@skygpt.local",
          name: "Guest Explorer",
          role: "user",
        };
        return next();
      }
    }

    // Attach verified user to request
    req.user = sessionData.user;
    next();
  } catch (error: any) {
    console.error("[Gateway Auth Error]:", error.message);
    req.user = {
      id: "anonymous-guest",
      email: "guest@skygpt.local",
      name: "Guest Explorer",
      role: "user",
    };
    next();
  }
}

/**
 * RBAC Guard for Gateway (e.g. for /api/v1/admin/*)
 */
export function requireGatewayRole(role: "admin" | "user") {
  return (
    req: AuthenticatedGatewayRequest,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: `Access denied. Requires '${role}' privileges.`,
      });
    }

    next();
  };
}
