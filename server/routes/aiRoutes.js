import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getSuggestion, improveTask, breakdownTask } from '../controllers/aiController.js';

const router = express.Router();

router.post('/suggestion', protect, getSuggestion);
router.post('/improve', protect, improveTask);
router.post('/breakdown', protect, breakdownTask);

export default router;