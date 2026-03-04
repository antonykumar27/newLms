// const multer = require("multer");
// const cloudinary = require("cloudinary").v2;
// const fs = require("fs");
// const path = require("path");
// require("dotenv").config();

// // ✅ Cloudinary Config
// cloudinary.config({
//   cloud_name: process.env.CLOUDINART_NAME,
//   api_key: process.env.CLOUDINART_API_KEY,
//   api_secret: process.env.CLOUDINART_API_SECRET,
// });

// // ✅ Helper: Sanitize File Name
// const sanitizeFilename = (filename) => {
//   return filename
//     .replace(/[^\w\-\.]/gi, "_") // Replace anything not word/underscore/dash/dot
//     .replace(/_+/g, "_"); // Prevent multiple underscores
// };

// // ✅ Upload Function
// const uploadFileToCloudinary = async (file) => {
//   const ext = path.extname(file.originalname);
//   const base = path.basename(file.originalname, ext);
//   const sanitizedBase = sanitizeFilename(base);
//   const publicId = `${sanitizedBase}_${Date.now()}`;

//   const isPDF = file.mimetype === "application/pdf";
//   const isAudio = file.mimetype.startsWith("audio/");
//   const isVideo = file.mimetype.startsWith("video/");
//   const isImage = file.mimetype.startsWith("image/");

//   // 📄 PDF
//   if (isPDF) {
//     const pdfUpload = await cloudinary.uploader.upload(file.path, {
//       resource_type: "raw",
//       public_id: publicId,
//       overwrite: false,
//     });

//     const previewUpload = await cloudinary.uploader.upload(file.path, {
//       resource_type: "image",
//       format: "jpg",
//       public_id: `${publicId}_preview`,
//       overwrite: false,
//     });

//     return {
//       url: previewUpload.secure_url,
//       pdfUrl: pdfUpload.secure_url,
//       type: "pdf",
//     };
//   }

//   // 🎵 AUDIO → upload as VIDEO (Cloudinary rule)
//   const uploaded = await cloudinary.uploader.upload(file.path, {
//     resource_type: isAudio || isVideo ? "video" : "image",
//     public_id: publicId,
//     overwrite: false,
//   });

//   return {
//     url: uploaded.secure_url,
//     type: isAudio ? "audio" : isVideo ? "video" : "image",
//   };
// };

// // ✅ Multer Setup
// const multerMiddleware = multer({
//   dest: "uploads/", // Temp folder
//   fileFilter: (req, file, cb) => {
//     const allowedFields = ["media"];
//     if (allowedFields.includes(file.fieldname)) {
//       cb(null, true);
//     } else {
//       cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
//     }
//   },
// }).fields([{ name: "media", maxCount: 10 }]);

// module.exports = { multerMiddleware, uploadFileToCloudinary };
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
  const ext = path.extname(file.originalname);
  const base = path.basename(file.originalname, ext);
  const sanitizedBase = sanitizeFilename(base);
  const publicId = `${sanitizedBase}_${Date.now()}`;

  const isPDF = file.mimetype === "application/pdf";
  const isAudio = file.mimetype.startsWith("audio/");
  const isVideo = file.mimetype.startsWith("video/");
  const isImage = file.mimetype.startsWith("image/");

  // 📄 PDF
  if (isPDF) {
    const pdfUpload = await cloudinary.uploader.upload(file.path, {
      resource_type: "raw",
      public_id: publicId,
      overwrite: false,
    });

    const previewUpload = await cloudinary.uploader.upload(file.path, {
      resource_type: "image",
      format: "jpg",
      public_id: `${publicId}_preview`,
      overwrite: false,
    });

    return {
      url: previewUpload.secure_url,
      pdfUrl: pdfUpload.secure_url,
      type: "pdf",
    };
  }

  // 🎵 AUDIO → upload as VIDEO (Cloudinary rule)
  const uploaded = await cloudinary.uploader.upload(file.path, {
    resource_type: isAudio || isVideo ? "video" : "image",
    public_id: publicId,
    overwrite: false,
  });

  return {
    url: uploaded.secure_url,
    type: isAudio ? "audio" : isVideo ? "video" : "image",
  };
};

// ✅ Multer Setup
const multerMiddleware = multer({
  dest: "uploads/", // Temp folder
  fileFilter: (req, file, cb) => {
    const allowedFields = ["media"];
    if (allowedFields.includes(file.fieldname)) {
      cb(null, true);
    } else {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
    }
  },
}).fields([{ name: "media", maxCount: 10 }]);

module.exports = { multerMiddleware, uploadFileToCloudinary };
