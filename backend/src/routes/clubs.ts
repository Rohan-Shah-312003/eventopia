import { Router } from 'express';
import { 
  createClub, 
  getClubs, 
  getClub, 
  updateClub, 
  deleteClub,
  addMember,
  removeMember
} from '../controllers/clubController';
import { protect } from '../middleware/auth';
import { validate, validateClub } from '../middleware/validation';

const router = Router();

// All routes are protected
router.use(protect);

// Club routes
router
  .route('/')
  .get(getClubs)
  .post(validateClub(), validate, createClub);

router
  .route('/:id')
  .get(getClub)
  .put(validateClub(), validate, updateClub)
  .delete(deleteClub);

// Club member management
router.post('/:clubId/members/:userId', addMember);
router.delete('/:clubId/members/:userId', removeMember);

export default router;
