import { z } from 'zod';
import Transaction from '../models/Transaction.js';
import AppError from '../utils/appError.js';

const transactionSchema = z.object({
  title: z.string().trim().min(2),
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  category: z.string().trim().min(1),
  description: z.string().trim().optional().default(''),
  paymentMethod: z.enum(['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Other']).optional().default('Cash'),
  notes: z.string().trim().optional().default(''),
  tags: z.array(z.string().trim()).optional().default([]),
  date: z.coerce.date().optional(),
});

export const getTransactions = async (req, res, next) => {
  try {
    const { type, category, paymentMethod, search, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Transaction.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      Transaction.countDocuments(filter),
    ]);

    res.json({ success: true, items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) || 1 });
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req, res, next) => {
  try {
    const payload = transactionSchema.parse(req.body);
    const transaction = await Transaction.create({ ...payload, user: req.user._id, date: payload.date || new Date() });

    res.status(201).json({ success: true, message: 'Transaction created', transaction });
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req, res, next) => {
  try {
    const payload = transactionSchema.partial().parse(req.body);
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });

    if (!transaction) {
      throw new AppError(404, 'Transaction not found');
    }

    Object.assign(transaction, payload);
    await transaction.save();

    res.json({ success: true, message: 'Transaction updated', transaction });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!transaction) {
      throw new AppError(404, 'Transaction not found');
    }

    res.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    next(error);
  }
};
