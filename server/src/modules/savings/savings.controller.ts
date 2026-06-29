import { Request, Response } from 'express';
import { SavingsService } from './savings.service';
import { sendSuccess, sendError } from '@/utils/response.helper';

const savingsService = new SavingsService();

export class SavingsController {
  /**
   * GET /api/v1/savings
   * Get all savings with filtering and pagination
   */
  async getAll(req: Request, res: Response) {
    try {
      const { memberId, month, year, page, limit } = req.query;
      const result = await savingsService.getAll({
        memberId: memberId as string | undefined,
        month: month ? parseInt(String(month)) : undefined,
        year: year ? parseInt(String(year)) : undefined,
        page: page ? parseInt(String(page)) : undefined,
        limit: limit ? parseInt(String(limit)) : undefined,
      });
      return sendSuccess(res, result.data, 'Savings retrieved', 200, result.meta);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch savings', 500);
    }
  }

  /**
   * POST /api/v1/savings
   * Create a new savings entry
   */
  async create(req: Request, res: Response) {
    try {
      const result = await savingsService.createSavings(req.body);
      return sendSuccess(res, result, 'Savings recorded', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to record savings', 400);
    }
  }

  /**
   * PATCH /api/v1/savings/:id
   * Update savings entry (amount and/or note)
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await savingsService.updateSavings(id, req.body);
      return sendSuccess(res, updated, 'Savings updated');
    } catch (error: any) {
      if (error.message === 'Savings entry not found') {
        return sendError(res, error.message, 404);
      }
      return sendError(res, error.message || 'Failed to update savings', 400);
    }
  }

  /**
   * DELETE /api/v1/savings/:id
   * Delete savings entry (reverse all effects)
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await savingsService.deleteSavings(id);
      return sendSuccess(res, null, 'Savings deleted and effects reversed');
    } catch (error: any) {
      if (error.message === 'Savings entry not found') {
        return sendError(res, error.message, 404);
      }
      return sendError(res, error.message || 'Failed to delete savings', 400);
    }
  }

  /**
   * GET /api/v1/savings/summary
   * Get monthly collection totals per year
   */
  async getSummary(req: Request, res: Response) {
    try {
      const { year } = req.query;
      const yearNum = year ? parseInt(String(year)) : undefined;
      // TODO: Implement aggregation logic
      const summary = []; // [{ month: number, total: number }]
      return sendSuccess(res, summary, 'Savings summary retrieved');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch savings summary', 500);
    }
  }

  /**
   * GET /api/v1/savings/member/:memberId
   * Get all savings for a specific member
   */
  async getMemberSavings(req: Request, res: Response) {
    try {
      const { memberId } = req.params;
      const result = await savingsService.getAll({
        memberId,
        page: 1,
        limit: 1000, // fetch all (or implement proper pagination)
      });
      return sendSuccess(res, result.data, 'Member savings retrieved', 200, result.meta);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch member savings', 500);
    }
  }
}