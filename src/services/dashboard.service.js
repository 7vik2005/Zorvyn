import Record from "../models/record.model.js";
import mongoose from "mongoose";

/**
 * GET DASHBOARD SUMMARY
 */
export const getDashboardSummary = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // --------------------------------------------------
  // 1. TOTAL INCOME & EXPENSE
  // --------------------------------------------------
  const totals = await Record.aggregate([
    {
      $match: {
        user: userObjectId,
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);

  let totalIncome = 0;
  let totalExpense = 0;

  totals.forEach((item) => {
    if (item._id === "income") totalIncome = item.total;
    if (item._id === "expense") totalExpense = item.total;
  });

  const netBalance = totalIncome - totalExpense;

  // --------------------------------------------------
  // 2. CATEGORY-WISE TOTALS
  // --------------------------------------------------
  const categoryBreakdown = await Record.aggregate([
    {
      $match: {
        user: userObjectId,
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: {
          category: "$category",
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
    {
      $sort: { total: -1 },
    },
  ]);

  // --------------------------------------------------
  // 3. MONTHLY TRENDS
  // --------------------------------------------------
  const monthlyTrends = await Record.aggregate([
    {
      $match: {
        user: userObjectId,
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);

  // --------------------------------------------------
  // 4. RECENT TRANSACTIONS
  // --------------------------------------------------
  const recentTransactions = await Record.find({
    user: userObjectId,
    isDeleted: false,
  })
    .sort({ date: -1 })
    .limit(5);

  // --------------------------------------------------
  // 5. FINAL RESPONSE
  // --------------------------------------------------
  return {
    totals: {
      income: totalIncome,
      expense: totalExpense,
      balance: netBalance,
    },
    categoryBreakdown,
    monthlyTrends,
    recentTransactions,
  };
};
