import express from 'express';
import { createEvent, getEvents, getEventById, registerForEvent } from '../controllers/eventController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', authenticateToken, requireRole(['FACULTY', 'ADMIN']), createEvent);
router.post('/:id/register', authenticateToken, registerForEvent);

export default router;