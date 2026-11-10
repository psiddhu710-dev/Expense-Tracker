import { z } from 'zod';
import SavingsGoal from '../models/SavingsGoal.js';
import AppError from '../utils/appError.js';

const goalSchema = z.object({
  name: z.string().trim().min(2),
  targetAmount: z.number().positive(),
  targetDate: z.coerce.date().optional(),
  description: z.string().trim().optional().default(''),
});

export const getGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, goals });
  } catch (error) {
    next(error);
  }
};

export const createGoal = async (req, res, next) => {
  try {
    const payload = goalSchema.parse(req.body);
    const goal = await SavingsGoal.create({ ...payload, user: req.user._id });
    res.status(201).json({ success: true, goal });
  } catch (error) {
    next(error);
  }
};

export const addContribution = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      throw new AppError(404, 'Goal not found');
    }

    const amount = Number(req.body.amount || 0);
    if (!amount || amount <= 0) {
      throw new AppError(400, 'Contribution amount must be greater than zero');
    }

    goal.currentAmount += amount;
    goal.contributions.push({ amount, date: new Date(), note: req.body.note || 'Added contribution' });
    if (goal.currentAmount >= goal.targetAmount) {
      goal.completed = true;
    }
    await goal.save();

    res.json({ success: true, goal });
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      throw new AppError(404, 'Goal not found');
    }

    const payload = goalSchema.partial().parse(req.body);
    Object.assign(goal, payload);
    await goal.save();
    res.json({ success: true, goal });
  } catch (error) {
    next(error);
  }
};

export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      throw new AppError(404, 'Goal not found');
    }

    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    next(error);
  }
};
