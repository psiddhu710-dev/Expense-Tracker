import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/profile', async (req, res) => {
  res.json({ success: true, user: req.user });
});

router.put('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.currency) user.currency = req.body.currency;
    if (req.body.theme) user.theme = req.body.theme;
    if (req.body.dateFormat) user.dateFormat = req.body.dateFormat;

    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

export default router;
