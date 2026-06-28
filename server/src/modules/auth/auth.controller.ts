import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess, sendError } from '@/utils/response.helper';

const authService = new AuthService();

export class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response) {
    try {
      const user = await authService.register(req.body);
      return sendSuccess(res, user, 'User registered successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Registration failed', 400);
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password, req);

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Remove refresh token from response body (don't send to client)
      const { refreshToken, ...response } = result;
      return sendSuccess(res, response, 'Login successful');
    } catch (error: any) {
      return sendError(res, error.message || 'Login failed', 401);
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response) {
    try {
      // Get user from req.user (set by auth middleware)
      const userId = (req as any).user?.id;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      await authService.logout(userId);

      // Clear refresh token cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return sendSuccess(res, null, 'Logged out successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Logout failed', 500);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return sendError(res, 'Refresh token not provided', 401);
      }

      const result = await authService.refreshToken(refreshToken);
      return sendSuccess(res, result, 'Token refreshed');
    } catch (error: any) {
      return sendError(res, error.message || 'Token refresh failed', 401);
    }
  }

  /**
   * Get current user profile
   */
  async profile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      const user = await authService.getProfile(userId);
      return sendSuccess(res, user, 'Profile retrieved');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch profile', 500);
    }
  }
}
