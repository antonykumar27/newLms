const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
require("dotenv").config();

/* ---------- CLOUDINARY CONFIG ---------- */
cloudinary.config({
  cloud_name: process.env.CLOUDINART_NAME,
  api_key: process.env.CLOUDINART_API_KEY,
  api_secret: process.env.CLOUDINART_API_SECRET,
});

/* ---------- SANITIZE FILENAME ---------- */
const sanitizeFilename = (filename) =>
  filename.replace(/[^\w\-\.]/gi, "_").replace(/_+/g, "_");

/* ---------- CLOUDINARY UPLOAD ---------- */
const uploadFileToCloudinary = async (file) => {
  const ext = path.extname(file.originalname);
  const base = path.basename(file.originalname, ext);
  const publicId = `${sanitizeFilename(base)}_${Date.now()}`;

  /* ---- PDF ---- */
  if (file.mimetype === "application/pdf") {
    const pdf = await cloudinary.uploader.upload(file.path, {
      resource_type: "raw",
      public_id: publicId,
    });

    const preview = await cloudinary.uploader.upload(file.path, {
      resource_type: "image",
      format: "jpg",
      public_id: `${publicId}_preview`,
    });

    return {
      url: preview.secure_url,
      pdfUrl: pdf.secure_url,
      type: "pdf",
    };
  }

  /* ---- IMAGE / VIDEO ---- */
  const uploaded = await cloudinary.uploader.upload(file.path, {
    resource_type: file.mimetype.startsWith("video") ? "video" : "image",
    public_id: publicId,
  });

  return {
    url: uploaded.secure_url,
    type: file.mimetype.startsWith("video") ? "video" : "image",
  };
};

/* ---------- MULTER CONFIG ---------- */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

/* ✔ allow media_0, media_1, media_2 ... */
/* ---------- FILE FILTER (IMPORTANT 🔥) ---------- */
const fileFilter = (req, file, cb) => {
  if (
    /^questions\[\d+\]\[questionImage\]$/.test(file.fieldname) ||
    /^questions\[\d+\]\[options\]\[\d+\]\[optionImage\]$/.test(file.fieldname)
  ) {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};

const multerMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    files: 10, // max 10 pages
    fileSize: 10 * 1024 * 1024, // 10MB
  },
}).any(); // 🔥 accept dynamic fields

module.exports = { multerMiddleware, uploadFileToCloudinary };
