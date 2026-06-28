import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { sendSuccess, sendError } from '@/utils/response.helper';

const usersService = new UsersService();

export class UsersController {
  /**
   * GET /api/v1/users
   * Get all users (admin only)
   */
  async getAll(req: Request, res: Response) {
    try {
      const users = await usersService.getAll();
      return sendSuccess(res, users, 'Users retrieved');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch users', 500);
    }
  }

  /**
   * POST /api/v1/users
   * Create a new user (admin only)
   */
  async create(req: Request, res: Response) {
    try {
      const user = await usersService.create(req.body);
      return sendSuccess(res, user, 'User created', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create user', 400);
    }
  }

  /**
   * PUT /api/v1/users/:id
   * Update user (admin only)
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await usersService.update(id, req.body);
      return sendSuccess(res, user, 'User updated');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update user', 400);
    }
  }

  /**
   * PATCH /api/v1/users/:id/toggle-status
   * Toggle user active status (admin only)
   */
  async toggleStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await usersService.toggleStatus(id);
      return sendSuccess(res, user, 'User status updated');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to toggle user status', 400);
    }
  }

  /**
   * DELETE /api/v1/users/:id
   * Soft delete user (set isActive = false) (admin only)
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await usersService.delete(id);
      return sendSuccess(res, null, 'User deactivated');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to deactivate user', 400);
    }
  }
}
