import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  CreditCard,
  Gauge,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  MailCheck,
  PiggyBank,
  PieChart,
  Plus,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import api from './services/api';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const chartColors = ['#8b5cf6', '#22c55e', '#f59e0b', '#38bdf8', '#ec4899', '#f97316'];

const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Transactions', to: '/transactions', icon: ReceiptText },
  { label: 'Budgets', to: '/budgets', icon: Wallet },
  { label: 'Goals', to: '/goals', icon: Target },
  { label: 'Analytics', to: '/analytics', icon: PieChart },
  { label: 'Settings', to: '/settings', icon: Settings },
];

const formatCurrency = (value = 0) => currencyFormatter.format(value);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
    </AuthProvider>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
      <Route path="/budgets" element={<ProtectedRoute><BudgetsPage /></ProtectedRoute>} />
      <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppShell({ title, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Could not log out');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="hidden min-h-screen w-72 border-r border-slate-800 bg-slate-950/90 p-6 lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-violet-300">Finance</p>
              <h1 className="text-xl font-semibold text-white">Expense Tracker</h1>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ label, to, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                    active ? 'bg-violet-500/15 text-violet-100 shadow-lg shadow-violet-900/20' : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-10 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-slate-900 p-4">
            <div className="flex items-center gap-2 text-violet-200">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-sm font-medium">Protected account</span>
            </div>
            <p className="mt-2 text-sm text-slate-300">Verified email security and encrypted wallet access.</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-200 transition hover:border-slate-500"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </aside>

        <main className="min-h-screen flex-1">
          <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-2 lg:hidden">
                <LayoutDashboard className="h-4 w-4 text-violet-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Overview</p>
                <h2 className="text-lg font-semibold text-white">{title}</h2>
              </div>
            </div>

            <div className="hidden items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 md:flex">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                className="w-56 border-0 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
                placeholder="Search transactions"
              />
            </div>

            <div className="flex items-center gap-3">
              <button type="button" className="rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-300">
                <Bell className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/15 font-semibold text-violet-200">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-400">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

function InputField({ label, type = 'text', value, onChange, placeholder, required = false }) {
  return (
    <label className="block text-sm text-slate-300">
      <span className="mb-1.5 block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-100 outline-none transition focus:border-violet-400"
      />
    </label>
  );
}

function StatCard({ title, value, icon: Icon, accent = 'violet' }) {
  const accentClasses = {
    violet: 'from-violet-500/20 to-violet-400/5 text-violet-200 border-violet-500/20',
    green: 'from-emerald-500/20 to-emerald-400/5 text-emerald-200 border-emerald-500/20',
    orange: 'from-orange-500/20 to-orange-400/5 text-orange-200 border-orange-500/20',
    sky: 'from-sky-500/20 to-sky-400/5 text-sky-200 border-sky-500/20',
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 ${accentClasses[accent]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-300">{title}</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{value}</h3>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-2">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const [overview, setOverview] = useState({ summary: { totalIncome: 0, totalExpenses: 0, totalBalance: 0 }, recent: [], categoryBreakdown: [], monthlyTrend: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const { data } = await api.get('/analytics/overview');
        setOverview(data);
      } catch (error) {
        toast.error('Unable to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const chartData = useMemo(() => {
    const keyed = {};
    overview.monthlyTrend.forEach((item) => {
      const label = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      if (!keyed[label]) {
        keyed[label] = { label, income: 0, expense: 0 };
      }
      keyed[label][item._id.type === 'income' ? 'income' : 'expense'] = item.total;
    });

    return Object.values(keyed).slice(-6);
  }, [overview.monthlyTrend]);

  const pieData = overview.categoryBreakdown.map((item, index) => ({ ...item, fill: chartColors[index % chartColors.length] }));

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        {loading ? (
          <div className="text-slate-300">Loading dashboard...</div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Total balance" value={formatCurrency(overview.summary.totalBalance)} icon={Gauge} accent="violet" />
              <StatCard title="Income" value={formatCurrency(overview.summary.totalIncome)} icon={TrendingUp} accent="green" />
              <StatCard title="Expenses" value={formatCurrency(overview.summary.totalExpenses)} icon={Wallet} accent="orange" />
              <StatCard title="Savings" value={formatCurrency(overview.summary.totalIncome - overview.summary.totalExpenses)} icon={PiggyBank} accent="sky" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/30">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Monthly financial trend</p>
                    <h3 className="text-xl font-semibold text-white">Income vs expenses</h3>
                  </div>
                  <Sparkles className="h-5 w-5 text-violet-300" />
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                      <XAxis dataKey="label" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="income" stroke="#8b5cf6" strokeWidth={3} />
                      <Line type="monotone" dataKey="expense" stroke="#22c55e" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Expense category mix</p>
                <h3 className="text-xl font-semibold text-white">Top spend areas</h3>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie data={pieData} dataKey="total" nameKey="_id" innerRadius={45} outerRadius={90} paddingAngle={3}>
                        {pieData.map((entry, index) => (
                          <Cell key={`${entry._id}-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Recent transactions</h3>
                  <Link to="/transactions" className="text-sm text-violet-300">View all</Link>
                </div>
                <div className="space-y-3">
                  {overview.recent.map((item) => (
                    <div key={item._id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                      <div>
                        <p className="font-medium text-white">{item.title}</p>
                        <p className="text-xs text-slate-400">{item.category} • {new Date(item.date).toLocaleDateString('en-IN')}</p>
                      </div>
                      <span className={item.type === 'income' ? 'text-emerald-300' : 'text-orange-300'}>
                        {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Quick insight</p>
                <h3 className="text-xl font-semibold text-white">Financial pulse</h3>
                <div className="mt-6 space-y-4">
                  <div className="rounded-xl bg-slate-950/60 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Savings rate</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {((overview.summary.totalIncome ? (overview.summary.totalBalance / overview.summary.totalIncome) * 100 : 0)).toFixed(1)}%
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-950/60 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Budget health</p>
                    <p className="mt-2 text-2xl font-semibold text-emerald-300">Excellent</p>
                  </div>
                  <div className="rounded-xl bg-slate-950/60 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Upcoming bills</p>
                    <p className="mt-2 text-lg font-semibold text-white">2 reminders</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Food',
    description: '',
    paymentMethod: 'Cash',
    notes: '',
  });

  const loadTransactions = async () => {
    const { data } = await api.get('/transactions');
    setTransactions(data.items || []);
  };

  const loadCategories = async () => {
    const { data } = await api.get('/categories');
    setCategories(data.categories || []);
    if (data.categories?.[0]) {
      setForm((prev) => ({ ...prev, category: data.categories[0].name }));
    }
  };

  useEffect(() => {
    Promise.all([loadTransactions(), loadCategories()]).catch(() => toast.error('Unable to load transactions'));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/transactions', {
        ...form,
        amount: Number(form.amount),
      });
      toast.success('Transaction saved');
      setForm({ ...form, title: '', amount: '', description: '', notes: '' });
      loadTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save transaction');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      toast.success('Transaction deleted');
      loadTransactions();
    } catch (error) {
      toast.error('Unable to delete transaction');
    }
  };

  return (
    <AppShell title="Transactions">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="mb-4 flex items-center gap-3">
            <Plus className="h-5 w-5 text-violet-300" />
            <h3 className="text-xl font-semibold text-white">Add transaction</h3>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <InputField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Grocery shopping" required />
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="2500" required />
              <label className="block text-sm text-slate-300">
                <span className="mb-1.5 block">Type</span>
                <select className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-100 outline-none" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-300">
                <span className="mb-1.5 block">Category</span>
                <select className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-100 outline-none" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {categories.map((option) => (
                    <option key={option._id} value={option.name}>{option.name}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-slate-300">
                <span className="mb-1.5 block">Payment method</span>
                <select className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-100 outline-none" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                  {['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Other'].map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </label>
            </div>
            <InputField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Groceries for the week" />
            <InputField label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Office monthly restock" />
            <button type="submit" className="w-full rounded-xl bg-violet-500 px-4 py-3 font-medium text-white transition hover:bg-violet-600">Save transaction</button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <h3 className="text-xl font-semibold text-white">Recent entries</h3>
          <div className="mt-4 space-y-3">
            {transactions.length === 0 ? (
              <p className="text-slate-400">No transactions yet.</p>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <div>
                    <p className="font-medium text-white">{transaction.title}</p>
                    <p className="text-xs text-slate-400">{transaction.category} • {new Date(transaction.date).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={transaction.type === 'income' ? 'text-emerald-300' : 'text-orange-300'}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                    <button type="button" onClick={() => handleDelete(transaction._id)} className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-200">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category: 'Food', amount: '', month: new Date().toISOString().slice(0, 7) });

  const loadData = async () => {
    const [budgetRes, categoryRes] = await Promise.all([api.get('/budgets'), api.get('/categories')]);
    setBudgets(budgetRes.data.budgets || []);
    setCategories(categoryRes.data.categories || []);
  };

  useEffect(() => {
    loadData().catch(() => toast.error('Unable to load budgets'));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/budgets', { ...form, amount: Number(form.amount) });
      toast.success('Budget created');
      setForm({ ...form, amount: '', category: categories[0]?.name || 'Food' });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Budget could not be created');
    }
  };

  return (
    <AppShell title="Budgets">
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <h3 className="text-xl font-semibold text-white">Create budget</h3>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm text-slate-300">
              <span className="mb-1.5 block">Category</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-100 outline-none">
                {categories.map((category) => (
                  <option key={category._id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </label>
            <InputField label="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="15000" required />
            <InputField label="Month" type="month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} required />
            <button type="submit" className="w-full rounded-xl bg-violet-500 px-4 py-3 font-medium text-white">Save budget</button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <h3 className="text-xl font-semibold text-white">Budget overview</h3>
          <div className="mt-4 space-y-3">
            {budgets.length === 0 ? (
              <p className="text-slate-400">No budgets scheduled yet.</p>
            ) : (
              budgets.map((budget) => {
                const progress = Math.min((budget.spent / budget.amount) * 100, 100);
                return (
                  <div key={budget._id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white">{budget.category}</p>
                      <span className="text-sm text-violet-200">{formatCurrency(budget.amount)}</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-violet-500" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
                      <span>Spent {formatCurrency(budget.spent)}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ name: '', targetAmount: '', targetDate: '', description: '' });

  const loadGoals = async () => {
    const { data } = await api.get('/goals');
    setGoals(data.goals || []);
  };

  useEffect(() => {
    loadGoals().catch(() => toast.error('Unable to load savings goals'));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/goals', { ...form, targetAmount: Number(form.targetAmount) });
      toast.success('Savings goal created');
      setForm({ name: '', targetAmount: '', targetDate: '', description: '' });
      loadGoals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create goal');
    }
  };

  return (
    <AppShell title="Savings goals">
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <h3 className="text-xl font-semibold text-white">Add goal</h3>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <InputField label="Goal name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Emergency fund" required />
            <InputField label="Target amount" type="number" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} placeholder="50000" required />
            <InputField label="Target date" type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
            <InputField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Travel and security fund" />
            <button type="submit" className="w-full rounded-xl bg-violet-500 px-4 py-3 font-medium text-white">Create goal</button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <h3 className="text-xl font-semibold text-white">Goal progress</h3>
          <div className="mt-4 space-y-3">
            {goals.length === 0 ? (
              <p className="text-slate-400">No savings goals created yet.</p>
            ) : (
              goals.map((goal) => {
                const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                return (
                  <div key={goal._id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white">{goal.name}</p>
                      <span className="text-sm text-emerald-300">{Math.round(progress)}%</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="mt-2 text-sm text-slate-300">
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function AnalyticsPage() {
  const [overview, setOverview] = useState({ summary: { totalIncome: 0, totalExpenses: 0 }, categoryBreakdown: [], monthlyTrend: [] });

  useEffect(() => {
    api.get('/analytics/overview')
      .then(({ data }) => setOverview(data))
      .catch(() => toast.error('Unable to load analytics'));
  }, []);

  const monthlyData = useMemo(() => {
    const keys = {};
    overview.monthlyTrend.forEach((entry) => {
      const key = `${entry._id.year}-${String(entry._id.month).padStart(2, '0')}`;
      if (!keys[key]) keys[key] = { key, income: 0, expense: 0 };
      keys[key][entry._id.type === 'income' ? 'income' : 'expense'] += entry.total;
    });
    return Object.values(keys);
  }, [overview.monthlyTrend]);

  const categoryData = overview.categoryBreakdown.map((item, index) => ({ ...item, fill: chartColors[index % chartColors.length] }));

  return (
    <AppShell title="Analytics">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Income" value={formatCurrency(overview.summary.totalIncome)} icon={TrendingUp} accent="green" />
          <StatCard title="Expenses" value={formatCurrency(overview.summary.totalExpenses)} icon={Wallet} accent="orange" />
          <StatCard title="Balance" value={formatCurrency(overview.summary.totalIncome - overview.summary.totalExpenses)} icon={IndianRupee} accent="violet" />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <h3 className="text-xl font-semibold text-white">Monthly comparison</h3>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis dataKey="key" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="income" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expense" fill="#22c55e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <h3 className="text-xl font-semibold text-white">Category insight</h3>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie data={categoryData} dataKey="total" nameKey="_id" innerRadius={46} outerRadius={92} paddingAngle={4}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`${entry._id}-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function SettingsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', currency: 'INR', dateFormat: 'dd/MM/yyyy' });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({ ...prev, name: user.name || prev.name }));
    }
  }, [user]);

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      await api.put('/users/profile', form);
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Could not update settings');
    }
  };

  return (
    <AppShell title="Settings">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <h3 className="text-xl font-semibold text-white">Profile and preferences</h3>
        <form className="mt-6 grid gap-5 md:grid-cols-2" onSubmit={handleSave}>
          <InputField label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label className="block text-sm text-slate-300">
            <span className="mb-1.5 block">Currency</span>
            <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-100 outline-none">
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </label>
          <label className="block text-sm text-slate-300">
            <span className="mb-1.5 block">Date format</span>
            <select value={form.dateFormat} onChange={(e) => setForm({ ...form, dateFormat: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-100 outline-none">
              <option value="dd/MM/yyyy">dd/MM/yyyy</option>
              <option value="MM/dd/yyyy">MM/dd/yyyy</option>
              <option value="yyyy-MM-dd">yyyy-MM-dd</option>
            </select>
          </label>
          <label className="block text-sm text-slate-300">
            <span className="mb-1.5 block">Theme</span>
            <select className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-100 outline-none">
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </label>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="rounded-xl bg-violet-500 px-5 py-3 font-medium text-white hover:bg-violet-600">Save settings</button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await login(form);
      toast.success(response.message || 'Logged in successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <AuthLayout>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/50">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-violet-300">Welcome back</p>
            <h2 className="text-2xl font-semibold text-white">Sign in to Expense Tracker</h2>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <InputField label="Email address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" required />
          <InputField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="********" required />
          <div className="flex items-center justify-between text-sm text-slate-300">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-slate-600 bg-slate-950" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-violet-300">Forgot password?</Link>
          </div>
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 font-medium text-white transition hover:bg-violet-600">
            Login <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          New to Expense Tracker? <Link to="/register" className="font-medium text-violet-300">Create account</Link>
        </div>
      </div>
    </AuthLayout>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', agree: false });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.agree) {
      toast.error('You must accept the terms and conditions');
      return;
    }

    try {
      const response = await register(form);
      toast.success(response.message || 'Verification OTP sent');
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <AuthLayout>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/50">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-violet-300">Create account</p>
            <h2 className="text-2xl font-semibold text-white">Join Expense Tracker</h2>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <InputField label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" required />
          <InputField label="Email address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" required />
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimum 8 chars" required />
            <InputField label="Confirm password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Repeat password" required />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={form.agree} onChange={(e) => setForm({ ...form, agree: e.target.checked })} className="rounded border-slate-600 bg-slate-950" />
            Agree to terms and conditions
          </label>
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 font-medium text-white transition hover:bg-violet-600">
            Create account <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}

function VerifyOtpPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [otp, setOtp] = useState('');
  const [email] = useState(state?.email || '');

  const handleVerify = async (event) => {
    event.preventDefault();
    try {
      await api.post('/auth/verify-email', { email, otp });
      toast.success('Email verified successfully');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    }
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('A new OTP has been sent');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not resend OTP');
    }
  };

  return (
    <AuthLayout>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/50">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200">
            <MailCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-violet-300">Verify email</p>
            <h2 className="text-2xl font-semibold text-white">Enter OTP</h2>
          </div>
        </div>

        <p className="mb-4 text-sm text-slate-300">We sent a 6-digit code to {email?.replace(/(.{2})(.*)(@.*)/, '$1***$3') || 'your email'}</p>
        <form className="space-y-4" onSubmit={handleVerify}>
          <InputField label="One-time password" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" required />
          <button type="submit" className="w-full rounded-xl bg-violet-500 px-4 py-3 font-medium text-white">Verify email</button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
          <button type="button" onClick={handleResend} className="text-violet-300">Resend OTP</button>
          <button type="button" onClick={() => navigate('/register')} className="text-slate-400">Change email</button>
        </div>
      </div>
    </AuthLayout>
  );
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Reset OTP sent');
      navigate('/reset-password', { state: { email } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset OTP');
    }
  };

  return (
    <AuthLayout>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/50">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-violet-300">Reset access</p>
            <h2 className="text-2xl font-semibold text-white">Forgot password</h2>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <InputField label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
          <button type="submit" className="w-full rounded-xl bg-violet-500 px-4 py-3 font-medium text-white">Send reset code</button>
        </form>
      </div>
    </AuthLayout>
  );
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({ email: state?.email || '', otp: '', password: '', confirmPassword: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/auth/reset-password', form);
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed');
    }
  };

  return (
    <AuthLayout>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/50">
        <h2 className="mb-6 text-2xl font-semibold text-white">Reset password</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <InputField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <InputField label="OTP" value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })} placeholder="123456" required />
          <InputField label="New password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="New password" required />
          <InputField label="Confirm password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Confirm password" required />
          <button type="submit" className="w-full rounded-xl bg-violet-500 px-4 py-3 font-medium text-white">Update password</button>
        </form>
      </div>
    </AuthLayout>
  );
}

function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.2),transparent_35%),linear-gradient(135deg,#020617,#0f172a_50%,#111827)] px-4 py-10 text-slate-100">
      <div className="w-full max-w-xl">{children}</div>
    </div>
  );
}

export default App;
