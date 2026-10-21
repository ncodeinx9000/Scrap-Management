import express from "express";
import { auth } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { addStaff } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/", auth, authorize("admin"), addStaff);

export default router;