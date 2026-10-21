import Category from "../models/category.model.js";
import ScrapItem from "../models/scrapItem.model.js";

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Category name is required." });
    const category = await Category.create({ name: name.trim(), description, organisationId: req.user.organisationId });
    return res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: "This category already exists." });
    console.error("createCategory error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ organisationId: req.user.organisationId }).sort({ name: 1 });
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error("getCategories error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const organisationId = req.user.organisationId;
    const inUse = await ScrapItem.exists({ categoryId: id, organisationId });
    if (inUse) return res.status(400).json({ success: false, message: "Category is used by scrap items." });
    const deleted = await Category.findOneAndDelete({ _id: id, organisationId });
    if (!deleted) return res.status(404).json({ success: false, message: "Category not found." });
    return res.status(200).json({ success: true, message: "Category deleted." });
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ success: false, message: "Invalid category ID." });
    console.error("deleteCategory error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong." });
  }
};
