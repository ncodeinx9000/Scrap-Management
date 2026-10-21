import ScrapItem from "../models/scrapItem.model.js";
import Transaction from "../models/transaction.model.js";

const TYPES = ["sold", "recycled", "donated", "disposed"];

// POST /api/scrap/:id/dispose  (admin only)
export const disposeScrapItem = async (req, res) => {
  let claimedItem = null;

  try {
    const { type, buyerName, amountReceived, date, notes } = req.body;

    // 1. Validate before touching the database
    if (!TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: "Type must be sold, recycled, donated or disposed." });
    }
    if (type === "sold" && !buyerName?.trim()) {
      return res.status(400).json({ success: false, message: "Buyer name is required for a sale." });
    }

    const amount = Number(amountReceived ?? 0);
    if (Number.isNaN(amount) || amount < 0) {
      return res.status(400).json({ success: false, message: "Amount must be 0 or more." });
    }

    const transactionDate = date ? new Date(date) : new Date();
    if (Number.isNaN(transactionDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date." });
    }

    // 2. Atomically claim the item: only works if it is in this org AND still in_stock
    claimedItem = await ScrapItem.findOneAndUpdate(
      { _id: req.params.id, organisationId: req.user.organisationId, status: "in_stock" },
      { status: type },   // status names match the transaction types
      { new: true }
    );

    if (!claimedItem) {
      return res.status(404).json({
        success: false,
        message: "Scrap item not found or already processed.",
      });
    }

    // 3. Record the transaction
    const transaction = await Transaction.create({
      scrapItemId: claimedItem._id,
      organisationId: req.user.organisationId,
      type,
      buyerName,
      amountReceived: amount,
      date: transactionDate,
      performedBy: req.user.userId,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: `Item marked as ${type}.`,
      data: { transaction, item: claimedItem },
    });
  } catch (error) {
    // If the item was claimed but the transaction failed, put the item back
    if (claimedItem) {
      await ScrapItem.findByIdAndUpdate(claimedItem._id, { status: "in_stock" });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid ID format." });
    }
    console.error("disposeScrapItem error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

// GET /api/transactions?type=&from=&to=&page=1&limit=10  (admin only)
export const getTransactions = async (req, res) => {
  try {
    const { type, from, to } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const filter = { organisationId: req.user.organisationId };

    if (type && TYPES.includes(type)) filter.type = type;

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("scrapItemId", "name quantity unit")
        .populate("performedBy", "name")
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: transactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("getTransactions error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong." });
  }
};