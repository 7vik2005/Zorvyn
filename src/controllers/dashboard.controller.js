import { getDashboardSummary } from "../services/dashboard.service.js";

/**
 * @desc    Get dashboard analytics (totals, trends, category breakdown, recent activity)
 * @route   GET /api/dashboard
 * @access  Private (Analyst + Admin)
 */
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const summary = await getDashboardSummary(userId);

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch dashboard data",
    });
  }
};
