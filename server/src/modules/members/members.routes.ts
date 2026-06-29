import { Router } from 'express';
import { MembersController } from './members.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/rbac.middleware';

const router = Router();
const membersController = new MembersController();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/members - list with pagination, search, status filter
router.get('/', membersController.getAll.bind(membersController));

// GET /api/v1/members/:id - member detail with savings summary
router.get('/:id', membersController.getById.bind(membersController));

// POST /api/v1/members - create member (ADMIN, ACCOUNTANT)
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), membersController.create.bind(membersController));

// PATCH /api/v1/members/:id - update member (ADMIN, ACCOUNTANT)
router.patch('/:id', requireRole('ADMIN', 'ACCOUNTANT'), membersController.update.bind(membersController));

// PATCH /api/v1/members/:id/toggle-status - activate/deactivate (ADMIN, ACCOUNTANT)
router.patch('/:id/toggle-status', requireRole('ADMIN', 'ACCOUNTANT'), membersController.toggleStatus.bind(membersController));

// GET /api/v1/members/:id/statement - savings statement with totals
router.get('/:id/statement', membersController.getStatement.bind(membersController));

export default router;