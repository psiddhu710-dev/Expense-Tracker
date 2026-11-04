const BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/expenses`;

async function request(url, options) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const getExpenses = () => request(BASE);
export const addExpense = (e) => request(BASE, { method: 'POST', body: JSON.stringify(e) });
export const updateExpense = (id, e) =>
  request(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(e) });
export const deleteExpense = (id) => request(`${BASE}/${id}`, { method: 'DELETE' });
