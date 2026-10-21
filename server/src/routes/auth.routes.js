import express from "express";
import { auth } from "../middleware/auth.js";
import { login, logout, getMe } from "../controllers/auth.controller.js";
const router = express.Router();
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", auth, getMe);
export default router;
