import { v2 as cloudinary } from "cloudinary";

const hasValidImageSignature = (buffer, mimeType) => {
  if (mimeType === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
  }
  if (mimeType === "image/webp") {
    return (
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    );
  }
  return false;
};

export const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Choose an image to upload.",
    });
  }

  if (!hasValidImageSignature(req.file.buffer, req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: "The selected file is not a valid JPG, PNG, or WebP image.",
    });
  }

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return res.status(503).json({
      success: false,
      message: "Cloudinary is not configured on the server.",
    });
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "scrap-management",
          resource_type: "image",
          allowed_formats: ["jpg", "png", "webp"],
        },
        (error, uploadedImage) => {
          if (error) return reject(error);
          resolve(uploadedImage);
        },
      );
      stream.end(req.file.buffer);
    });

    return res.status(200).json({
      success: true,
      data: { url: result.secure_url },
    });
  } catch (error) {
    console.error("Cloudinary image upload failed:", error.message);
    return res.status(502).json({
      success: false,
      message: "Image upload failed. Check the Cloudinary settings and try again.",
    });
  }
};
