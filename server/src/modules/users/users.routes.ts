import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/rbac.middleware';

const router = Router();
const usersController = new UsersController();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/', usersController.getAll.bind(usersController));
router.post('/', usersController.create.bind(usersController));
router.put('/:id', usersController.update.bind(usersController));
router.patch('/:id/toggle-status', usersController.toggleStatus.bind(usersController));
router.delete('/:id', usersController.delete.bind(usersController));

export default router;
