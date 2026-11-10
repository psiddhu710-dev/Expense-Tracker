export const defaultExpenseCategories = [
  { name: 'Food', color: '#f97316', icon: 'utensils' },
  { name: 'Transportation', color: '#3b82f6', icon: 'car' },
  { name: 'Shopping', color: '#8b5cf6', icon: 'shopping-bag' },
  { name: 'Entertainment', color: '#ec4899', icon: 'tv' },
  { name: 'Education', color: '#14b8a6', icon: 'book-open' },
  { name: 'Health', color: '#ef4444', icon: 'heart-pulse' },
  { name: 'Bills', color: '#facc15', icon: 'receipt' },
  { name: 'Rent', color: '#a855f7', icon: 'home' },
  { name: 'Travel', color: '#22c55e', icon: 'plane' },
  { name: 'Personal Care', color: '#f59e0b', icon: 'sparkles' },
  { name: 'Subscriptions', color: '#6366f1', icon: 'repeat' },
  { name: 'Other', color: '#94a3b8', icon: 'more-horizontal' },
];

export const defaultIncomeCategories = [
  { name: 'Salary', color: '#22c55e', icon: 'wallet' },
  { name: 'Freelancing', color: '#06b6d4', icon: 'briefcase' },
  { name: 'Business', color: '#8b5cf6', icon: 'store' },
  { name: 'Investments', color: '#10b981', icon: 'trending-up' },
  { name: 'Allowance', color: '#f59e0b', icon: 'gift' },
  { name: 'Gifts', color: '#ec4899', icon: 'gift' },
  { name: 'Other', color: '#94a3b8', icon: 'more-horizontal' },
];

export const defaultCategories = [...defaultExpenseCategories, ...defaultIncomeCategories];
