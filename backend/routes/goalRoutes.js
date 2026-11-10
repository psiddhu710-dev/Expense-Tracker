import express from 'express';
import { addContribution, createGoal, deleteGoal, getGoals, updateGoal } from '../controllers/goalController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.route('/').get(getGoals).post(createGoal);
router.route('/:id').put(updateGoal).delete(deleteGoal);
router.post('/:id/contribute', addContribution);

export default router;
