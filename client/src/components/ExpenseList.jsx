export default function ExpenseList({ expenses, onEdit, onDelete }) {
  if (!expenses.length) return <div className="card empty">No expenses yet. Add your first one!</div>;

  return (
    <div className="card">
      <ul className="list">
        {expenses.map((e) => (
          <li key={e._id}>
            <div className="info">
              <strong>{e.title}</strong>
              <span className={`badge ${e.category}`}>{e.category}</span>
              <small>{new Date(e.date).toLocaleDateString('en-IN')}</small>
            </div>
            <div className="right">
              <span className="amt">₹{e.amount.toLocaleString('en-IN')}</span>
              <button className="icon" onClick={() => onEdit(e)} title="Edit">✏️</button>
              <button className="icon" onClick={() => onDelete(e._id)} title="Delete">🗑️</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
