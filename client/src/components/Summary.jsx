const currency = (amount) => `₹${amount.toLocaleString('en-IN', {
  minimumFractionDigits: amount % 1 ? 2 : 0,
  maximumFractionDigits: 2,
})}`;

const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const transactionMonthKey = (value) => {
  const isoDate = String(value).match(/^(\d{4}-\d{2})/);
  return isoDate ? isoDate[1] : monthKey(new Date(value));
};

export default function Summary({ transactions }) {
  const now = new Date();
  const currentMonth = monthKey(now);
  const income = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const expenses = transactions
    .filter((transaction) => transaction.type !== 'income')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const thisMonthExpenses = transactions
    .filter((transaction) => transaction.type !== 'income' && transactionMonthKey(transaction.date) === currentMonth)
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const balance = income - expenses;

  const categoryTotals = transactions.reduce((totals, transaction) => {
    if (transaction.type !== 'income') {
      totals[transaction.category] = (totals[transaction.category] || 0) + Number(transaction.amount);
    }
    return totals;
  }, {});
  const categories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCategory = Math.max(1, ...categories.map(([, amount]) => amount));

  const monthTotals = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    const key = monthKey(date);
    return {
      key,
      label: date.toLocaleDateString('en-IN', { month: 'short' }),
      income: 0,
      expense: 0,
    };
  });
  const totalsByMonth = Object.fromEntries(monthTotals.map((month) => [month.key, month]));
  transactions.forEach((transaction) => {
    const month = totalsByMonth[transactionMonthKey(transaction.date)];
    if (month) month[transaction.type === 'income' ? 'income' : 'expense'] += Number(transaction.amount);
  });
  const maxMonth = Math.max(1, ...monthTotals.flatMap((month) => [month.income, month.expense]));

  return (
    <>
      <section className="summary" aria-label="Financial summary">
        <article className="stat-card balance-stat">
          <div className="stat-top"><span className="stat-icon" aria-hidden="true">◈</span><span className="stat-caption">OVERALL</span></div>
          <span className="stat-label">Total balance</span>
          <strong className={balance < 0 ? 'negative-balance' : ''}>{currency(balance)}</strong>
          <small>Income minus expenses</small>
        </article>
        <article className="stat-card income-stat">
          <div className="stat-top"><span className="stat-icon" aria-hidden="true">↗</span><span className="stat-caption">ALL TIME</span></div>
          <span className="stat-label">Total income</span>
          <strong>{currency(income)}</strong>
          <small>Money coming in</small>
        </article>
        <article className="stat-card expense-stat">
          <div className="stat-top"><span className="stat-icon" aria-hidden="true">↘</span><span className="stat-caption">ALL TIME</span></div>
          <span className="stat-label">Total expenses</span>
          <strong>{currency(expenses)}</strong>
          <small>Money going out</small>
        </article>
        <article className="stat-card month-stat">
          <div className="stat-top"><span className="stat-icon" aria-hidden="true">◷</span><span className="stat-caption">THIS MONTH</span></div>
          <span className="stat-label">Monthly spending</span>
          <strong>{currency(thisMonthExpenses)}</strong>
          <small>{transactions.length} transaction{transactions.length === 1 ? '' : 's'} tracked</small>
        </article>
      </section>

      <section className="insights-grid" aria-label="Spending insights">
        <article className="insight-card card">
          <div className="section-heading">
            <div><p className="eyebrow">INCOME VS. EXPENSES</p><h2>Monthly cash flow</h2></div>
            <span className="chart-period">Last 6 months</span>
          </div>
          <div className="legend">
            <span><i className="legend-income" /> Income</span>
            <span><i className="legend-expense" /> Expenses</span>
          </div>
          <div className="bar-chart">
            {monthTotals.map((month) => (
              <div className="month-column" key={month.key} aria-label={`${month.label}: income ${currency(month.income)}, expenses ${currency(month.expense)}`}>
                <div className="bar-pair">
                  <span className="chart-bar income-bar" style={{ height: `${Math.max(month.income ? 4 : 0, month.income / maxMonth * 100)}%` }} />
                  <span className="chart-bar expense-bar" style={{ height: `${Math.max(month.expense ? 4 : 0, month.expense / maxMonth * 100)}%` }} />
                </div>
                <span className="month-label">{month.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="insight-card card">
          <div className="section-heading">
            <div><p className="eyebrow">WHERE IT GOES</p><h2>Expense breakdown</h2></div>
            <span className="chart-period">Top categories</span>
          </div>
          {categories.length ? (
            <div className="category-breakdown">
              {categories.map(([category, amount], index) => (
                <div className="category-item" key={category}>
                  <div className="category-label"><span><i className={`category-dot dot-${index}`} />{category}</span><strong>{currency(amount)}</strong></div>
                  <div className="category-track"><span className={`category-progress progress-${index}`} style={{ width: `${amount / maxCategory * 100}%` }} /></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="chart-empty">Your spending categories will show up here.</div>
          )}
        </article>
      </section>
    </>
  );
}
