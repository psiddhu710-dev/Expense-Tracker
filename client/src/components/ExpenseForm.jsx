import { useEffect, useState } from 'react';

export const EXPENSE_CATEGORIES = [
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

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investments',
  'Gifts',
  'Other',
];

export const CATEGORIES = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];

const today = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const createEmptyForm = () => ({
  title: '',
  amount: '',
  category: 'Food & dining',
  type: 'expense',
  date: today(),
  notes: '',
});

export default function ExpenseForm({ onSubmit, editing, onCancel, saving }) {
  const [form, setForm] = useState(createEmptyForm);
  const [validationError, setValidationError] = useState('');
  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title || '',
        amount: String(editing.amount ?? ''),
        category: editing.category || 'Other',
        type: editing.type || 'expense',
        date: editing.date ? new Date(editing.date).toISOString().slice(0, 10) : today(),
        notes: editing.notes || '',
      });
    } else {
      setForm(createEmptyForm());
    }
    setValidationError('');
  }, [editing]);

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => {
      if (name === 'type') {
        const nextCategories = value === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
        return {
          ...current,
          type: value,
          category: nextCategories.includes(current.category) ? current.category : nextCategories[0],
        };
      }
      return { ...current, [name]: value };
    });
    setValidationError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.title.trim()) {
      setValidationError('Add a short description for this transaction.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setValidationError('Enter an amount greater than zero.');
      return;
    }
    if (!form.date) {
      setValidationError('Choose a transaction date.');
      return;
    }
    const succeeded = await onSubmit({
      ...form,
      title: form.title.trim(),
      amount,
      notes: form.notes.trim(),
    });
    if (succeeded && !editing) setForm(createEmptyForm());
  };

  return (
    <form className="card form" onSubmit={submit} noValidate>
      <div className="form-heading">
        <span className="form-mark" aria-hidden="true">{editing ? '↗' : '＋'}</span>
        <div>
          <p className="eyebrow">{editing ? 'MAKE A CHANGE' : 'KEEP YOUR LEDGER FRESH'}</p>
          <h2>{editing ? 'Edit transaction' : 'Add a transaction'}</h2>
        </div>
      </div>

      <fieldset className="type-toggle" aria-label="Transaction type">
        <label className={form.type === 'expense' ? 'selected expense-choice' : ''}>
          <input type="radio" name="type" value="expense" checked={form.type === 'expense'} onChange={change} />
          <span aria-hidden="true">↘</span> Expense
        </label>
        <label className={form.type === 'income' ? 'selected income-choice' : ''}>
          <input type="radio" name="type" value="income" checked={form.type === 'income'} onChange={change} />
          <span aria-hidden="true">↗</span> Income
        </label>
      </fieldset>

      <label className="input-label" htmlFor="transaction-title">Description</label>
      <input
        id="transaction-title"
        name="title"
        value={form.title}
        onChange={change}
        placeholder={form.type === 'income' ? 'e.g. Monthly salary' : 'e.g. Weekend groceries'}
        maxLength="120"
        required
      />

      <div className="form-row">
        <div className="field-group">
          <label className="input-label" htmlFor="transaction-amount">Amount</label>
          <div className="amount-input">
            <span aria-hidden="true">₹</span>
            <input
              id="transaction-amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={form.amount}
              onChange={change}
              placeholder="0.00"
              required
            />
          </div>
        </div>
        <div className="field-group">
          <label className="input-label" htmlFor="transaction-date">Date</label>
          <input id="transaction-date" name="date" type="date" value={form.date} onChange={change} required />
        </div>
      </div>

      <label className="input-label" htmlFor="transaction-category">Category</label>
      <select id="transaction-category" name="category" value={form.category} onChange={change}>
        {categories.map((category) => <option key={category}>{category}</option>)}
      </select>

      <label className="input-label" htmlFor="transaction-notes">Notes <span>(optional)</span></label>
      <textarea
        id="transaction-notes"
        name="notes"
        value={form.notes}
        onChange={change}
        placeholder="Add a little context…"
        rows="3"
        maxLength="500"
      />

      {validationError && <p className="form-error" role="alert">{validationError}</p>}
      <div className="form-actions">
        <button className="btn primary submit-button" type="submit" disabled={saving}>
          {saving ? 'Saving…' : editing ? 'Save changes' : 'Add transaction'}
        </button>
        {editing && (
          <button className="btn cancel-button" type="button" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        )}
      </div>
      {!editing && <p className="form-footnote">Your transactions are private to your workspace.</p>}
    </form>
  );
}
