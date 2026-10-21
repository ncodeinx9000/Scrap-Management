import express from "express";
import { auth } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { getDashboardStats } from "../controllers/getDashboardStats.controller.js";

const router = express.Router();

router.get("/stats", auth, authorize("admin"), getDashboardStats);

export default router;
