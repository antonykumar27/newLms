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
    .replace(/[^\w\-\.]/gi, "_") // Replace anything not word/underscore/dash/dot
    .replace(/_+/g, "_"); // Prevent multiple underscores
};

// ✅ Upload Function
const uploadFileToCloudinary = async (file) => {
  const ext = path.extname(file.originalname); // .pdf, .jpg, .mp4
  const base = path.basename(file.originalname, ext); // filename without extension
  const sanitizedBase = sanitizeFilename(base); // safe name
  const publicId = `${sanitizedBase}_${Date.now()}`; // prevent overwrites

  const isPDF = file.mimetype === "application/pdf";

  if (isPDF) {
    // ✅ Upload PDF (raw)
    const pdfUpload = await cloudinary.uploader.upload(file.path, {
      resource_type: "raw",
      public_id: publicId, // <-- This references 'public_id' variable, but you declared 'publicId'
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    });

    // ✅ Upload preview (image fallback)
    const previewUpload = await cloudinary.uploader.upload(file.path, {
      resource_type: "image",
      format: "jpg",
      public_id: `${publicId}_preview`,
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    });

    return {
      url: previewUpload.secure_url, // preview
      pdfUrl: pdfUpload.secure_url, // actual file
      type: "pdf",
    };
  }

  // ✅ For image or video
  const uploaded = await cloudinary.uploader.upload(file.path, {
    resource_type: file.mimetype.startsWith("video") ? "video" : "image",
    public_id: publicId, // ✅ Correct usage
    use_filename: true,
    unique_filename: false,
    overwrite: false,
  });

  return {
    url: uploaded.secure_url,
    type: file.mimetype.startsWith("image") ? "image" : "video",
  };
};

// ✅ Multer Setup
const multerMiddleware = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    const allowedFields = ["media", "resume", "idProof", "thumbnail"];

    if (allowedFields.includes(file.fieldname)) {
      cb(null, true);
    } else {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
    }
  },
}).fields([
  { name: "media", maxCount: 10 },
  { name: "resume", maxCount: 1 },
  { name: "idProof", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

module.exports = { multerMiddleware, uploadFileToCloudinary };
