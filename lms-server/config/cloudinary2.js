const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// ✅ Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINART_NAME,
  api_key: process.env.CLOUDINART_API_KEY,
  api_secret: process.env.CLOUDINART_API_SECRET,
});

// ✅ Helper: Sanitize File Name
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^\w\-\.]/gi, "_") // Replace non-safe chars
    .replace(/_+/g, "_"); // Avoid multiple underscores
};

// ✅ Cloudinary Upload Function
const uploadFileToCloudinary = async (file) => {
  const ext = path.extname(file.originalname);
  const base = path.basename(file.originalname, ext);
  const sanitizedBase = sanitizeFilename(base);
  const publicId = `${sanitizedBase}_${Date.now()}`;

  const isPDF = file.mimetype === "application/pdf";

  if (isPDF) {
    const pdfUpload = await cloudinary.uploader.upload(file.path, {
      resource_type: "raw",
      public_id: publicId, // ✅ FIXED
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    });

    const previewUpload = await cloudinary.uploader.upload(file.path, {
      resource_type: "image",
      format: "jpg",
      public_id: `${publicId}_preview`, // ✅ keep this for preview
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    });

    return {
      url: previewUpload.secure_url,
      pdfUrl: pdfUpload.secure_url,
      type: "pdf",
    };
  }

  const uploaded = await cloudinary.uploader.upload(file.path, {
    resource_type: file.mimetype.startsWith("video") ? "video" : "image",
    public_id: publicId, // ✅ FIXED
    use_filename: true,
    unique_filename: false,
    overwrite: false,
  });

  return {
    url: uploaded.secure_url,
    type: file.mimetype.startsWith("image") ? "image" : "video",
  };
};

// ✅ Multer Middleware
const multerMiddleware = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    const allowedFields = ["media", "profile_image", "cover_image"];
    if (allowedFields.includes(file.fieldname)) {
      cb(null, true);
    } else {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }
  },
}).fields([
  { name: "media", maxCount: 10 },
  { name: "profile_image", maxCount: 1 },
  { name: "cover_image", maxCount: 1 },
]);

module.exports = { multerMiddleware, uploadFileToCloudinary };
