const path = require("path");
const dotenv = require("dotenv");

// Load environment variables at the very top
dotenv.config({ path: path.join(__dirname, "config/config.env") });
// THEN load redis
// require("./config/redisClient.js");
const express = require("express");
const { app, server } = require("./server");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectDatabase = require("./config/database");
const errorMiddleware = require("./middlewares/error");
// Load environment variables

// CORS options
// const corsOptions = {
//   origin: [
//     "http://localhost:5173", // web dev
//     "http://localhost:5174",
//     "http://localhost:3000",
//     "http://localhost:8000",
//     "https://prolinksocialclient.onrender.com",
//     "http://10.245.214.233",
//     "http://10.195.79.233:8000",
//     process.env.FRONTEND_URL,
//     process.env.MOBILE_CLIENT_URL, // Add this line
//   ],
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true,
// };

connectDatabase();
// Middleware
// app.use(cors(corsOptions)); // Apply CORS once
app.use(cors({ origin: true, credentials: true }));
// app.use(
//   cors({
//     origin: "*", // allow all for testing
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );
app.use(express.json()); // Parse JSON data once
app.use(cookieParser()); // Cookie parsing
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Static file serving for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const authenticationRoutes = require("./routes/loginUserRoutes");
const standardSubjectsRoutes = require("./routes/standardSubjectRoutes");
const teacherRoutescourse = require("./routes/teacherRoutes");
const adminRoutes = require("./routes/adminRoutes");
const courseRoutes = require("./routes/courseRoutes");
const createChapterRoutes = require("./routes/standardChapter");
const chapterPagesRoutes = require("./routes/standardPages");
const mathsLessonsRoutes = require("./routes/mathsLesson");
const questions = require("./routes/quastionAndResult");
const studentDiscussionRoutes = require("./routes/discussionRoutes");
const analyticsRoutes = require("./routes/analytics.js");
const razorpayPayment = require("./routes/razorpayPayment.js");
const progressRoutes = require("./routes/progressRoutes.js");
const studentAllDetailsGetAndSendRoutes = require("./routes/studentAllDetailsGetAndSendRoutes.js");

// const studentprogressRoutes = require("./routes/studentprogressRoutes.js");
// Routes
app.use("/api/v1/authentication", authenticationRoutes);

app.use("/api/v1/teacherRoutes", teacherRoutescourse);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/courseRoutes", courseRoutes);
app.use("/api/v1/standardSubjects", standardSubjectsRoutes);
app.use("/api/v1/createChapter", createChapterRoutes);
app.use("/api/v1/chapterPages", chapterPagesRoutes);
app.use("/api/v1/mathsLessons", mathsLessonsRoutes);
app.use("/api/v1/questions", questions);
app.use("/api/v1/studentDiscussion", studentDiscussionRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/razorpay", razorpayPayment);
app.use("/api/v1/progressRoutes", progressRoutes);
app.use(
  "/api/v1/studentAllDetailsGetAndSend",
  studentAllDetailsGetAndSendRoutes,
);
// app.use("/api/v1/studentprogressRoutes", studentprogressRoutes);
// Production configuration
if (process.env.NODE_ENV === "production") {
  console.log("Hello production");
  // Serve frontend static files
  app.use(express.static(path.join(__dirname, "../client/dist")));

  // For any route, serve the index.html (SPA fallback)
  app.get("*", (req, res) => {
    console.log("Hello production2");
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API running...ok");
  });
}
app.use(errorMiddleware);
// Start server
const PORT = process.env.PORT || 5000;
console.log("PORT from env:", process.env.PORT);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
// vDUE4wXymHHfY9V8;antonykumar27_db_user;
// mongodb+srv://antonykumar27_db_user:vDUE4wXymHHfY9V8@cluster0.qzj9aox.mongodb.net/?appName=Cluster0
/////image Update server code

// // 🔹 Media
// const mediaFiles = req.files?.media || [];
// const newMediaUploads = [];

// for (const file of mediaFiles) {
//   const uploaded = await uploadFileToCloudinary(file);

//   if (uploaded?.url) {
//     newMediaUploads.push({
//       url: uploaded.url,
//       type: uploaded.type || "image",
//       pdfUrl: null,
//     });
//   }

//   fs.unlink(file.path, () => {});
// }

// // decide update
// if (newMediaUploads.length > 0) {
//   // delete old media
//   if (standard.media?.length > 0) {
//     for (const old of standard.media) {
//       const publicId = old.url.split("/").pop().split(".")[0];
//       await cloudinary.uploader.destroy(publicId);
//     }
//   }

//   updateData.media = newMediaUploads;
// } else {
//   // keep old media safely
//   updateData.media = standard.media;
// }

//image upload client

// Add media if exists
// if (formData.media) {
//   if (formData.media instanceof File) {
//     submitFormData.append("media", formData.media);
//   } else if (typeof formData.media === "string") {
//     submitFormData.append("media", formData.media);
//   } else if (formData.media.url) {
//     submitFormData.append("media", formData.media.url);
//   }
// }
