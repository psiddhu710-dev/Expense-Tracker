import { useEffect, useMemo, useState } from 'react';
import ExpenseForm, { CATEGORIES } from './components/ExpenseForm.jsx';
import ExpenseList from './components/ExpenseList.jsx';
import Summary from './components/Summary.jsx';
import { getExpenses, addExpense, updateExpense, deleteExpense } from './api.js';

const sortTransactions = (items) =>
  [...items].sort((a, b) => new Date(b.date) - new Date(a.date));

const formatDate = (value, options) =>
  new Date(value).toLocaleDateString('en-IN', { ...options, timeZone: 'UTC' });

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [editing, setEditing] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getExpenses()
      .then((data) => {
        if (active) setTransactions(sortTransactions(data));
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visibleTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return transactions.filter((transaction) => {
      const matchesCategory =
        categoryFilter === 'All' || transaction.category === categoryFilter;
      const matchesType = typeFilter === 'All' || transaction.type === typeFilter;
      const matchesQuery =
        !normalizedQuery ||
        [transaction.title, transaction.notes, transaction.category]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesCategory && matchesType && matchesQuery;
    });
  }, [transactions, categoryFilter, typeFilter, query]);

  const handleSubmit = async (data) => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      if (editing) {
        const updated = await updateExpense(editing._id, data);
        setTransactions((current) =>
          sortTransactions(current.map((item) => (item._id === updated._id ? updated : item)))
        );
        setEditing(null);
        setNotice('Transaction updated.');
      } else {
        const created = await addExpense(data);
        setTransactions((current) => sortTransactions([created, ...current]));
        setNotice('Transaction added.');
      }
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (transaction) => {
    const label = transaction.title || 'this transaction';
    if (!window.confirm(`Delete "${label}"? This action cannot be undone.`)) return;
    setError('');
    setNotice('');
    try {
      await deleteExpense(transaction._id);
      setTransactions((current) => current.filter((item) => item._id !== transaction._id));
      if (editing?._id === transaction._id) setEditing(null);
      setNotice('Transaction deleted.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="Pennywise home">
          <span className="brand-mark" aria-hidden="true">p</span>
          <span>Pennywise</span>
        </a>
        <p className="sidebar-label">WORKSPACE</p>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-link active" href="#overview"><span aria-hidden="true">⌂</span> Overview</a>
          <a className="nav-link" href="#transactions"><span aria-hidden="true">↕</span> Transactions</a>
          <a className="nav-link" href="#add-transaction"><span aria-hidden="true">＋</span> Add transaction</a>
        </nav>
        <div className="sidebar-note">
          <span className="note-icon" aria-hidden="true">✦</span>
          <strong>Small steps add up.</strong>
          <p>Every transaction tells a story. Keep yours moving in the right direction.</p>
        </div>
        <div className="sidebar-footer">
          <span className="avatar" aria-hidden="true">Y</span>
          <span><strong>Your finances</strong><small>Personal workspace</small></span>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR FINANCIAL SNAPSHOT</p>
            <h1>Good money habits start here<span>.</span></h1>
            <p className="page-subtitle">A clearer view of your money, all in one place.</p>
          </div>
          <a className="btn primary topbar-action" href="#add-transaction">＋ Add transaction</a>
        </header>

        {error && (
          <div className="feedback error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError('')} aria-label="Dismiss error">×</button>
          </div>
        )}
        {notice && (
          <div className="feedback success" role="status">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice('')} aria-label="Dismiss message">×</button>
          </div>
        )}

        {loading ? (
          <div className="loading-state card" role="status">Loading your financial overview…</div>
        ) : (
          <>
            <Summary transactions={transactions} />
            <div className="dashboard-grid">
              <section className="recent-section card" aria-labelledby="recent-heading">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">LATEST ACTIVITY</p>
                    <h2 id="recent-heading">Recent transactions</h2>
                  </div>
                  <a className="text-link" href="#transactions">View all <span aria-hidden="true">→</span></a>
                </div>
                {transactions.length === 0 ? (
                  <div className="recent-empty">
                    <span aria-hidden="true">◷</span>
                    <strong>Your story starts with one transaction.</strong>
                    <p>Add your income or first expense to see it here.</p>
                  </div>
                ) : (
                  <ul className="recent-list">
                    {transactions.slice(0, 5).map((transaction) => (
                      <li key={transaction._id}>
                        <span className={`category-icon icon-${(transaction.category || 'other').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} aria-hidden="true">
                          {transaction.type === 'income' ? '↗' : '↘'}
                        </span>
                        <span className="recent-info">
                          <strong>{transaction.title}</strong>
                          <small>{transaction.category} <span>·</span> {formatDate(transaction.date, { day: 'numeric', month: 'short' })}</small>
                        </span>
                        <strong className={`recent-amount ${transaction.type}`}>
                          {transaction.type === 'income' ? '+' : '−'}{formatCurrency(transaction.amount)}
                        </strong>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="form-section" id="add-transaction">
                <ExpenseForm
                  onSubmit={handleSubmit}
                  editing={editing}
                  onCancel={() => setEditing(null)}
                  saving={saving}
                />
              </section>

              <section className="transactions-section card" id="transactions" aria-labelledby="transactions-heading">
                <div className="section-heading transaction-heading">
                  <div>
                    <p className="eyebrow">YOUR MONEY, ORGANIZED</p>
                    <h2 id="transactions-heading">All transactions</h2>
                  </div>
                  <span className="result-count">{visibleTransactions.length} shown</span>
                </div>
                <div className="filters" aria-label="Filter transactions">
                  <label className="search-field">
                    <span aria-hidden="true">⌕</span>
                    <input
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search transactions"
                      aria-label="Search transactions"
                    />
                  </label>
                  <label className="filter-field">
                    <span className="sr-only">Filter by type</span>
                    <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                      <option value="All">All types</option>
                      <option value="income">Income</option>
                      <option value="expense">Expenses</option>
                    </select>
                  </label>
                  <label className="filter-field">
                    <span className="sr-only">Filter by category</span>
                    <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                      <option value="All">All categories</option>
                      {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                    </select>
                  </label>
                </div>
                <ExpenseList
                  expenses={visibleTransactions}
                  onEdit={setEditing}
                  onDelete={handleDelete}
                />
              </section>
            </div>
          </>
        )}
        <footer className="page-footer">Made for a little more financial peace of mind.</footer>
      </main>
    </div>
  );
}

function formatCurrency(value) {
  return `₹${Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: Number(value) % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}
