import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Other'], default: 'Cash' },
    notes: { type: String, default: '' },
    tags: [{ type: String, trim: true }],
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1, category: 1 });

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

export default Transaction;
