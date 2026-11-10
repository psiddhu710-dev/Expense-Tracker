import mongoose from 'mongoose';

const recurringTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, required: true },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    nextRunAt: { type: Date, required: true },
    isPaused: { type: Boolean, default: false },
    description: { type: String, default: '' },
    paymentMethod: { type: String, default: 'Cash' },
  },
  { timestamps: true },
);

const RecurringTransaction = mongoose.models.RecurringTransaction || mongoose.model('RecurringTransaction', recurringTransactionSchema);

export default RecurringTransaction;
