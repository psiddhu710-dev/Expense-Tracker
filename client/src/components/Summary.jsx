export default function Summary({ expenses }) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const month = new Date().toISOString().slice(0, 7);
  const thisMonth = expenses
    .filter((e) => e.date.slice(0, 7) === month)
    .reduce((s, e) => s + e.amount, 0);
  const fmt = (n) => '₹' + n.toLocaleString('en-IN');

  return (
    <div className="summary">
      <div className="card stat"><span>Total spent</span><strong>{fmt(total)}</strong></div>
      <div className="card stat"><span>This month</span><strong>{fmt(thisMonth)}</strong></div>
      <div className="card stat"><span>Entries</span><strong>{expenses.length}</strong></div>
    </div>
  );
}
