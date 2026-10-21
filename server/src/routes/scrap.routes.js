import express from "express";
import { auth } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { disposeScrapItem } from "../controllers/transactions.controller.js";
import {
  addScrapItem,
  getScrapItems,
  getScrapItemById,
  editScrapItem,
  deleteScrapItem,
} from "../controllers/scrap.controller.js";

const router = express.Router();

router.post("/", auth, authorize("admin", "staff"), addScrapItem);
router.get("/", auth, getScrapItems);
router.get("/:id", auth, getScrapItemById);
router.put("/:id", auth, authorize("admin", "staff"), editScrapItem);
router.delete("/:id", auth, authorize("admin"), deleteScrapItem);
router.post("/:id/dispose", auth, authorize("admin"), disposeScrapItem);

export default router;
