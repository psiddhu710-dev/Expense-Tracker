const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const BASE = `${API_ROOT}/api/expenses`;

async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to reach the API. Check that the server is running and try again.');
    }
    throw error;
  }

  const contentType = response.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (!response.ok) throw new Error(data?.message || `Request failed with status ${response.status}`);
  return data;
}

export const getExpenses = () => request(BASE);
export const addExpense = (transaction) =>
  request(BASE, { method: 'POST', body: JSON.stringify(transaction) });
export const updateExpense = (id, transaction) =>
  request(`${BASE}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(transaction),
  });
export const deleteExpense = (id) =>
  request(`${BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' });
