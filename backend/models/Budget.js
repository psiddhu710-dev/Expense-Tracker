import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    spent: { type: Number, default: 0 },
    month: { type: String, required: true },
    limitType: { type: String, enum: ['monthly', 'category'], default: 'category' },
    alertsSent: [{ type: String }],
  },
  { timestamps: true },
);

budgetSchema.index({ user: 1, month: 1, category: 1 }, { unique: true });

const Budget = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);

export default Budget;
