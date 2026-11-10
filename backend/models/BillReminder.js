import mongoose from 'mongoose';

const billReminderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
    note: { type: String, default: '' },
  },
  { timestamps: true },
);

const BillReminder = mongoose.models.BillReminder || mongoose.model('BillReminder', billReminderSchema);

export default BillReminder;
