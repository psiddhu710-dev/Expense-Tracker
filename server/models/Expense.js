const mongoose = require('mongoose');

const EXPENSE_CATEGORIES = [
  'Food',
  'Bills',
  'Housing',
  'Food & dining',
  'Transport',
  'Shopping',
  'Bills & utilities',
  'Health',
  'Entertainment',
  'Travel',
  'Education',
  'Personal care',
  'Other',
];

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investments',
  'Gifts',
  'Other',
];

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: [0.01, 'Amount must be greater than zero'] },
    category: {
      type: String,
      enum: [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])],
      default: 'Other',
    },
    type: { type: String, enum: ['income', 'expense'], default: 'expense' },
    date: { type: Date, default: Date.now },
    notes: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

expenseSchema.pre('validate', function validateCategoryForType(next) {
  const categories = this.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  if (!categories.includes(this.category)) {
    this.invalidate('category', `Choose a valid ${this.type} category`);
  }
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);
