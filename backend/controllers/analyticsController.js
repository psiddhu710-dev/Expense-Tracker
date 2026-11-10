import Transaction from '../models/Transaction.js';

export const getOverview = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const startDate = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = to ? new Date(to) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);

    const result = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = {
      totalIncome: 0,
      totalExpenses: 0,
      totalBalance: 0,
      totalTransactions: 0,
    };

    result.forEach((entry) => {
      const key = entry._id === 'income' ? 'totalIncome' : 'totalExpenses';
      summary[key] = entry.total;
      summary.totalTransactions += entry.count;
    });

    summary.totalBalance = summary.totalIncome - summary.totalExpenses;

    const recent = await Transaction.find({ user: req.user._id }).sort({ date: -1 }).limit(5);
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate },
          type: 'expense',
        },
      },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 6 },
    ]);

    const monthlyTrend = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: new Date(new Date().getFullYear(), 0, 1), $lte: endDate },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$date' }, year: { $year: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ success: true, summary, recent, categoryBreakdown, monthlyTrend });
  } catch (error) {
    next(error);
  }
};
