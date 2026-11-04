import { useEffect, useState } from 'react';

export const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Other'];

const today = () => new Date().toISOString().slice(0, 10);
const empty = { title: '', amount: '', category: 'Food', date: today() };

export default function ExpenseForm({ onSubmit, editing, onCancel }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    setForm(
      editing
        ? {
            title: editing.title,
            amount: editing.amount,
            category: editing.category,
            date: editing.date.slice(0, 10),
          }
        : empty
    );
  }, [editing]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    await onSubmit({ ...form, amount: Number(form.amount) });
    if (!editing) setForm({ ...empty, date: today() });
  };

  return (
    <form className="card form" onSubmit={submit}>
      <h2>{editing ? 'Edit expense' : 'Add expense'}</h2>
      <input name="title" placeholder="What did you spend on?" value={form.title} onChange={change} required />
      <div className="row">
        <input name="amount" type="number" min="0" step="0.01" placeholder="Amount (₹)" value={form.amount} onChange={change} required />
        <input name="date" type="date" value={form.date} onChange={change} required />
      </div>
      <select name="category" value={form.category} onChange={change}>
        {CATEGORIES.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <div className="row">
        <button className="btn primary" type="submit">{editing ? 'Update' : 'Add expense'}</button>
        {editing && (
          <button className="btn" type="button" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  );
}
