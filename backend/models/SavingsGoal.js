import mongoose from 'mongoose';

const savingsGoalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    targetAmount: { type: Number, required: true, min: 0 },
    currentAmount: { type: Number, default: 0 },
    targetDate: { type: Date },
    description: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    contributions: [
      {
        amount: Number,
        date: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true },
);

const SavingsGoal = mongoose.models.SavingsGoal || mongoose.model('SavingsGoal', savingsGoalSchema);

export default SavingsGoal;
