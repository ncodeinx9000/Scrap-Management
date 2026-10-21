import Category from "../models/category.model.js";
import ScrapItem from "../models/scrapItem.model.js";

export const addScrapItem = async (req, res) => {
  try {
    const {
      name,
      categoryId,
      quantity,
      unit,
      condition,
      location,
      estimatedValue,
      notes,
      imageUrl,
    } = req.body;

    if (
      !name ||
      !categoryId ||
      !(Number(quantity) > 0) ||
      !unit ||
      !condition
    ) {
      return res.status(400).json({
        success: false,
        message: "All field are required",
      });
    }

    const isCategory = await Category.findOne({
      _id: categoryId,
      organisationId: req.user.organisationId,
    });
    if (!isCategory) {
      return res.status(400).json({
        success: false,
        message: "Category isn't added",
      });
    }

    const addScrap = await ScrapItem.create({
      name,
      categoryId,
      quantity,
      unit,
      condition,
      location,
      estimatedValue,
      notes,
      imageUrl,
      organisationId: req.user.organisationId,
      addedBy: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Scrap Item added",
      data: addScrap,
    });
  } catch (error) {
    // Mongoose rejects bad enum values(e.g. unit: "tons") with a ValidationError
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    // A malformed categoryId (not a valid ObjectId) throws a CastError
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Id format." });
    }

    console.error("addScrapItem error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const deleteScrapItem = async (req, res) => {
  try {
    

    const item = await ScrapItem.findOne({
      _id: req.params.id,
      organisationId: req.user.organisationId,
    });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Scrap Item not found",
      });
    }

    // Item that were sold/recylced have a transaction record, so keep them
    if (item.status !== "in_stock") {
      return res.status(400).json({
        success: false,
        message:
          "Sold or disposed items cannot be deleted bacause they are part of your records.",
      });
    }

    await item.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Scrap Item is deleted",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format." });
    }
    console.error("deleteScrapItem error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};

export const editScrapItem = async (req, res) => {
  try {
    const item = await ScrapItem.findOne({
      _id: req.params.id,
      organisationId: req.user.organisationId,
    });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Scrap Item not found",
      });
    }

    if (
      req.user.role === "staff" &&
      item.addedBy.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only edit the scrap created by you.",
      });
    }

    if (item.status !== "in_stock") {
      return res.status(400).json({
        success: false,
        message: `This item is already ${item.status} and cannot be edited.`,
      });
    }

    const allowed = [
      "name",
      "categoryId",
      "quantity",
      "unit",
      "condition",
      "location",
      "estimatedValue",
      "notes",
      "imageUrl",
    ];

    const updates = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (updates.quantity !== undefined && Number(updates.quantity) <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Quantity must be greater than 0." });
    }

    // If the category is being changed, it must belong to this organisation
    if (updates.categoryId) {
      const validCategory = await Category.exists({
        _id: updates.categoryId,
        organisationId: req.user.organisationId,
      });
      if (!validCategory) {
        return res.status(400).json({ success: false, message: "Invalid category." });
      }
    }

    Object.assign(item, updates);
    await item.save();  // save() runs the schema validators(enums, min, required)

    return res.status(200).json({
      success: true,
      message: "Scrap item updated.",
      data: item,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid ID format." });
    }
    console.error("editScrapItem error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong." });
  }
  }


// Escapes special characters so a search like "chair (old)" doesn't break the regex
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/scrap?search=&category=&status=&condition=&page=1&limit=10
export const getScrapItems = async (req, res) => {
  try {
    const { search, category, status, condition } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    // Always start with the organisation filter
    const filter = { organisationId: req.user.organisationId };

    if (search?.trim())
      filter.name = { $regex: escapeRegex(search.trim()), $options: "i" };
    if (category) filter.categoryId = category;
    if (status) filter.status = status;
    if (condition) filter.condition = condition;

    const [items, total] = await Promise.all([
      ScrapItem.find(filter)
        .populate("categoryId", "name") // gives category name instead of just the id
        .populate("addedBy", "name")
        .sort({ createdAt: -1 }) // newest first
        .skip((page - 1) * limit)
        .limit(limit),
      ScrapItem.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid filter value." });
    }
    console.error("getScrapItems error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};

// GET /api/scrap/:id
export const getScrapItemById = async (req, res) => {
  try {
    const item = await ScrapItem.findOne({
      _id: req.params.id,
      organisationId: req.user.organisationId,
    })
      .populate("categoryId", "name")
      .populate("addedBy", "name");

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Scrap item not found." });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format." });
    }
    console.error("getScrapItemById error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};
