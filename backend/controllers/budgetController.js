import { z } from 'zod';
import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import AppError from '../utils/appError.js';

const budgetSchema = z.object({
  category: z.string().trim().min(1),
  amount: z.number().positive(),
  month: z.string().trim().min(1),
  limitType: z.enum(['monthly', 'category']).optional().default('category'),
});

const getBudgetSpent = async (userId, category, month) => {
  const [year, memberMonth] = month.split('-');
  const start = new Date(Number(year), Number(memberMonth) - 1, 1, 0, 0, 0);
  const end = new Date(Number(year), Number(memberMonth), 1, 0, 0, 0);

  const total = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        category,
        type: 'expense',
        date: { $gte: start, $lt: end },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  return total[0]?.total || 0;
};

export const getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ user: req.user._id }).sort({ createdAt: -1 });
    const enriched = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await getBudgetSpent(req.user._id, budget.category, budget.month);
        return { ...budget.toObject(), spent };
      }),
    );

    res.json({ success: true, budgets: enriched });
  } catch (error) {
    next(error);
  }
};

export const createBudget = async (req, res, next) => {
  try {
    const payload = budgetSchema.parse(req.body);
    const budget = await Budget.create({ ...payload, user: req.user._id });
    const spent = await getBudgetSpent(req.user._id, budget.category, budget.month);
    res.status(201).json({ success: true, budget: { ...budget.toObject(), spent } });
  } catch (error) {
    next(error);
  }
};

export const updateBudget = async (req, res, next) => {
  try {
    const payload = budgetSchema.partial().parse(req.body);
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });

    if (!budget) {
      throw new AppError(404, 'Budget not found');
    }

    Object.assign(budget, payload);
    await budget.save();

    const spent = await getBudgetSpent(req.user._id, budget.category, budget.month);
    res.json({ success: true, budget: { ...budget.toObject(), spent } });
  } catch (error) {
    next(error);
  }
};

export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!budget) {
      throw new AppError(404, 'Budget not found');
    }

    res.json({ success: true, message: 'Budget deleted' });
  } catch (error) {
    next(error);
  }
};
