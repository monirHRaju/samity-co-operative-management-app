import { Request, Response } from 'express';
import { MembersService } from './members.service';
import { sendSuccess, sendError } from '@/utils/response.helper';

const membersService = new MembersService();

export class MembersController {
  /**
   * GET /api/v1/members
   * Get all members with pagination, search, and status filter
   */
  async getAll(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20, search = '', status } = req.query;
      const result = await membersService.getAll({
        page: parseInt(String(page)),
        limit: parseInt(String(limit)),
        search: String(search),
        status: status as any, // Assuming MemberStatus enum values match
      });
      return sendSuccess(res, result.data, 'Members retrieved', 200, result.meta);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch members', 500);
    }
  }

  /**
   * GET /api/v1/members/:id
   * Get member by ID with savings summary
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const member = await membersService.findById(id);
      return sendSuccess(res, member, 'Member retrieved');
    } catch (error: any) {
      if (error.message === 'Member not found') {
        return sendError(res, error.message, 404);
      }
      return sendError(res, error.message || 'Failed to fetch member', 500);
    }
  }

  /**
   * POST /api/v1/members
   * Create a new member (ADMIN, ACCOUNTANT)
   */
  async create(req: Request, res: Response) {
    try {
      const member = await membersService.create(req.body);
      return sendSuccess(res, member, 'Member created', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create member', 400);
    }
  }

  /**
   * PATCH /api/v1/members/:id
   * Update member (ADMIN, ACCOUNTANT)
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const member = await membersService.update(id, req.body);
      return sendSuccess(res, member, 'Member updated');
    } catch (error: any) {
      if (error.message === 'Member not found') {
        return sendError(res, error.message, 404);
      }
      return sendError(res, error.message || 'Failed to update member', 400);
    }
  }

  /**
   * PATCH /api/v1/members/:id/toggle-status
   * Activate/deactivate member (ADMIN, ACCOUNTANT)
   */
  async toggleStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const member = await membersService.toggleStatus(id);
      const action = member.status === 'ACTIVE' ? 'activated' : 'deactivated';
      return sendSuccess(res, member, `Member ${action}`);
    } catch (error: any) {
      if (error.message === 'Member not found') {
        return sendError(res, error.message, 404);
      }
      return sendError(res, error.message || 'Failed to toggle member status', 500);
    }
  }

  /**
   * GET /api/v1/members/:id/statement
   * Get member's savings statement with totals
   */
  async getStatement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const statement = await membersService.getStatement(id);
      return sendSuccess(res, statement, 'Member statement retrieved');
    } catch (error: any) {
      if (error.message === 'Member not found') {
        return sendError(res, error.message, 404);
      }
      return sendError(res, error.message || 'Failed to fetch member statement', 500);
    }
  }

  /**
   * DELETE /api/v1/members/:id
   * Soft delete member (set status to INACTIVE) (ADMIN only?)
   * Spec didn't specify delete endpoint, but we can implement as deactivation.
   * We'll reuse toggleStatus to set inactive, or we can implement actual delete if needed.
   * For now, we'll not expose DELETE; but spec didn't include DELETE for members.
   * We'll omit DELETE method.
   */
}