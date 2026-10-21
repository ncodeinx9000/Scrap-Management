import express from "express";
import { auth } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { createCategory, getCategories, deleteCategory } from "../controllers/categories.controller.js";
const router = express.Router();
router.get("/", auth, getCategories);
router.post("/", auth, authorize("admin"), createCategory);
router.delete("/:id", auth, authorize("admin"), deleteCategory);
export default router;
