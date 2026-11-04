export default function ExpenseList({ expenses, onEdit, onDelete }) {
  if (!expenses.length) {
    return (
      <div className="empty-state">
        <span className="empty-icon" aria-hidden="true">↗</span>
        <strong>No transactions found</strong>
        <p>Try changing your filters or add a new transaction.</p>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      {expenses.map((transaction) => (
        <article className="transaction-row" key={transaction._id}>
          <span
            className={`category-icon icon-${(transaction.category || 'other').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            aria-hidden="true"
          >
            {transaction.type === 'income' ? '↗' : '↘'}
          </span>
          <div className="transaction-info">
            <strong>{transaction.title}</strong>
            <span>{transaction.category} <span className="meta-dot">·</span> {new Date(transaction.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</span>
            {transaction.notes && <small>{transaction.notes}</small>}
          </div>
          <span className={`type-badge ${transaction.type || 'expense'}`}>
            {transaction.type === 'income' ? 'Income' : 'Expense'}
          </span>
          <strong className={`transaction-amount ${transaction.type === 'income' ? 'income' : 'expense'}`}>
            {transaction.type === 'income' ? '+' : '−'}₹{Number(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: Number(transaction.amount) % 1 ? 2 : 0, maximumFractionDigits: 2 })}
          </strong>
          <div className="row-actions">
            <button className="icon-button" type="button" onClick={() => onEdit(transaction)} aria-label={`Edit ${transaction.title}`} title="Edit transaction">✎</button>
            <button className="icon-button delete-action" type="button" onClick={() => onDelete(transaction)} aria-label={`Delete ${transaction.title}`} title="Delete transaction">×</button>
          </div>
        </article>
      ))}
    </div>
  );
}
