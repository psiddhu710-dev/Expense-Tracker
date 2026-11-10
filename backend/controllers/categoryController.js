import { z } from 'zod';
import Category from '../models/Category.js';
import Transaction from '../models/Transaction.js';
import AppError from '../utils/appError.js';

const categorySchema = z.object({
  name: z.string().trim().min(2),
  type: z.enum(['income', 'expense']),
  color: z.string().trim().default('#8b5cf6'),
  icon: z.string().trim().default('tag'),
});

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ user: req.user._id }).sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const payload = categorySchema.parse(req.body);
    const category = await Category.create({ ...payload, user: req.user._id });
    res.status(201).json({ success: true, message: 'Category created', category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const payload = categorySchema.partial().parse(req.body);
    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });

    if (!category) {
      throw new AppError(404, 'Category not found');
    }

    Object.assign(category, payload);
    await category.save();

    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });

    if (!category) {
      throw new AppError(404, 'Category not found');
    }

    const usedInTransaction = await Transaction.exists({ user: req.user._id, category: category.name });
    if (usedInTransaction) {
      throw new AppError(400, 'Cannot delete a category still used by transactions. Reassign or update the records first.');
    }

    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};
