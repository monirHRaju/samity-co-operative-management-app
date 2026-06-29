import { Router } from 'express';
import { SavingsController } from './savings.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/rbac.middleware';

const router = Router();
const savingsController = new SavingsController();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/savings - list with filtering and pagination
router.get('/', savingsController.getAll.bind(savingsController));

// POST /api/v1/savings - create savings entry
router.post('/', savingsController.create.bind(savingsController));

// PATCH /api/v1/savings/:id - update savings entry (amount/note)
router.patch('/:id', savingsController.update.bind(savingsController));

// DELETE /api/v1/savings/:id - delete savings entry (reverse effects)
router.delete('/:id', savingsController.delete.bind(savingsController));

// GET /api/v1/savings/summary - monthly collection totals per year
router.get('/summary', savingsController.getSummary.bind(savingsController));

// GET /api/v1/savings/member/:memberId - all savings for a member
router.get('/member/:memberId', savingsController.getMemberSavings.bind(savingsController));

export default router;