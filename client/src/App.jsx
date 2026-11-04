import { useEffect, useState } from 'react';
import ExpenseForm, { CATEGORIES } from './components/ExpenseForm.jsx';
import ExpenseList from './components/ExpenseList.jsx';
import Summary from './components/Summary.jsx';
import { getExpenses, addExpense, updateExpense, deleteExpense } from './api.js';

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');

  const load = () =>
    getExpenses().then(setExpenses).catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (data) => {
    try {
      setError('');
      if (editing) {
        await updateExpense(editing._id, data);
        setEditing(null);
      } else {
        await addExpense(data);
      }
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try { await deleteExpense(id); load(); } catch (e) { setError(e.message); }
  };

  const visible = filter === 'All' ? expenses : expenses.filter((e) => e.category === filter);

  return (
    <div className="container">
      <header>
        <h1>💸 Expense Tracker</h1>
        <p>Track where your money goes</p>
      </header>

      {error && <div className="error">{error}</div>}

      <Summary expenses={expenses} />

      <div className="layout">
        <ExpenseForm onSubmit={handleSubmit} editing={editing} onCancel={() => setEditing(null)} />
        <div>
          <div className="filter">
            <label>Filter:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option>All</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <ExpenseList expenses={visible} onEdit={setEditing} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
}
