import express from "express";
import { auth } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { getTransactions } from "../controllers/transactions.controller.js";

const router = express.Router();

router.get("/", auth, authorize("admin"), getTransactions);

export default router;
