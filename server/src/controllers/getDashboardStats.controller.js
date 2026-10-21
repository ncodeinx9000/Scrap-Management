import mongoose from "mongoose";
import ScrapItem from "../models/scrapItem.model.js";
import Transaction from "../models/transaction.model.js";

// GET /api/dashboard/stats  (admin only)
export const getDashboardStats = async (req, res) => {
  try {
    // IMPORTANT: aggregate() does NOT auto-convert strings to ObjectId like find() does.
    // The id in the JWT is a string, so convert it manually or $match returns nothing.
    const orgId = new mongoose.Types.ObjectId(req.user.organisationId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [stockAgg, revenueAgg, soldThisMonth, categoryAgg, monthlyAgg] = await Promise.all([
      // 1. Items in stock + their total estimated value
      ScrapItem.aggregate([
        { $match: { organisationId: orgId, status: "in_stock" } },
        { $group: { _id: null, count: { $sum: 1 }, value: { $sum: "$estimatedValue" } } },
      ]),

      // 2. Total revenue from all sales
      Transaction.aggregate([
        { $match: { organisationId: orgId, type: "sold" } },
        { $group: { _id: null, revenue: { $sum: "$amountReceived" } } },
      ]),

      // 3. Number of sales this month
      Transaction.countDocuments({
        organisationId: orgId,
        type: "sold",
        date: { $gte: startOfMonth },
      }),

      // 4. In-stock items per category (pie chart)
      ScrapItem.aggregate([
        { $match: { organisationId: orgId, status: "in_stock" } },
        { $group: { _id: "$categoryId", value: { $sum: 1 } } },
        {
          $lookup: {
            from: "categories", // Mongoose pluralizes the model name "Category"
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        { $project: { _id: 0, name: { $ifNull: ["$category.name", "Unknown"] }, value: 1 } },
        { $sort: { value: -1 } },
      ]),

      // 5. Revenue per month for the last 6 months (bar chart)
      Transaction.aggregate([
        { $match: { organisationId: orgId, type: "sold", date: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: "$date" }, month: { $month: "$date" } },
            revenue: { $sum: "$amountReceived" },
          },
        },
      ]),
    ]);

    // Fill in months that had no sales, so the chart always shows 6 bars
    const revenueByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const found = monthlyAgg.find(
        (m) => m._id.year === d.getFullYear() && m._id.month === d.getMonth() + 1
      );
      revenueByMonth.push({
        month: d.toLocaleString("en-US", { month: "short" }), // "Oct"
        revenue: found ? found.revenue : 0,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        itemsInStock: stockAgg[0]?.count || 0,
        totalStockValue: stockAgg[0]?.value || 0,
        totalRevenue: revenueAgg[0]?.revenue || 0,
        soldThisMonth,
        itemsByCategory: categoryAgg,  // [{ name: "Steel", value: 5 }, ...] works directly with Recharts
        revenueByMonth,                // [{ month: "Oct", revenue: 12000 }, ...]
      },
    });
  } catch (error) {
    console.error("getDashboardStats error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong." });
  }
};