import express from "express";
import { createOrganisation } from "../controllers/organisation.controller.js";
const router = express.Router();
router.post("/register", createOrganisation);
export default router;
