import { Router, Response } from 'express';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middlewares/auth';
import { auth } from '../lib/auth';

const router = Router();

/**
 * POST /api/v1/auth/admin/create-admin
 * Protected endpoint: Only an active Admin can create another Admin.
 */
router.post(
  '/create-admin',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'email, password, and name are required',
        });
      }

      if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Password must be at least 8 characters long',
        });
      }

      // Create new Admin user using Better Auth administrative API
      const result = await auth.api.createUser({
        body: {
          email: email.toLowerCase(),
          password,
          name,
          role: 'admin',
        },
      });

      console.log(`[Admin] Admin "${req.user?.email}" successfully created new admin "${email.toLowerCase()}"`);

      return res.status(201).json({
        success: true,
        message: 'Admin account created successfully',
        data: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
        },
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: 'Admin Creation Failed',
        message: error.message || 'Unable to create admin account',
      });
    }
  }
);

export default router;
