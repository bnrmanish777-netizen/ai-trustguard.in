import { getDashboardSummary } from '../services/dashboardService.js';

export const getDashboard = async (req, res, next) => {
  try {
    const summary = await getDashboardSummary(req.user ? req.user.id : null);
    res.json(summary);
  } catch (err) {
    next(err);
  }
};
