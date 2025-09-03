import { Router } from 'express';
import { 
  getUsers, 
  getUser, 
  updateUser, 
  deleteUser,
  updateUserRole 
} from '../controllers/userController';
import { protect, authorize } from '../middleware/auth';
import { validate, validateUserUpdate } from '../middleware/validation';

const router = Router();

// All routes are protected
router.use(protect);

// Admin only routes
router.use(authorize('ADMIN'));

// User management routes
router
  .route('/')
  .get(getUsers);

router
  .route('/:id')
  .get(getUser)
  .put(validateUserUpdate(), validate, updateUser)
  .delete(deleteUser);

// Role management
router.put('/:id/role', updateUserRole);

export default router;
