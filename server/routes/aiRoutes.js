import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  getSuggestion, 
  improveTask, 
  breakdownTask,
  parseBrainDump,
  energySuggestions,
  doItForMe,
  dailyReflection
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/suggestion', protect, getSuggestion);
router.post('/improve', protect, improveTask);
router.post('/breakdown', protect, breakdownTask);

// NEW AI Features
router.post('/parse-dump', protect, parseBrainDump);
router.post('/energy-suggestions', protect, energySuggestions);
router.post('/do-it-for-me', protect, doItForMe);
router.post('/daily-reflection', protect, dailyReflection);

export default router;