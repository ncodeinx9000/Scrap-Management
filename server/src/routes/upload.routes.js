import express from "express";
import multer from "multer";
import { auth } from "../middleware/auth.js";
import { uploadImage } from "../controllers/upload.controller.js";

const router = express.Router();
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      const error = new Error("Only JPG, PNG, and WebP images are allowed.");
      error.code = "INVALID_FILE_TYPE";
      return callback(error);
    }
    callback(null, true);
  },
});

router.post("/", auth, upload.single("image"), uploadImage);

router.use((error, _req, res, next) => {
  if (error instanceof multer.MulterError) {
    const tooLarge = error.code === "LIMIT_FILE_SIZE";
    return res.status(tooLarge ? 413 : 400).json({
      success: false,
      message: tooLarge
        ? "Image must be 2 MB or smaller."
        : "Upload one image at a time.",
    });
  }
  if (error.code === "INVALID_FILE_TYPE") {
    return res.status(400).json({ success: false, message: error.message });
  }
  next(error);
});

export default router;
