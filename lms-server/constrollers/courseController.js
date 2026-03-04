// controllers/lmsProjects/courseController.js
const mongoose = require("mongoose");
const Course = require("../models/course");
const Like = require("../models/likeSchema");
const Wishlist = require("../models/wishlistSchema");
const Share = require("../models/shareSchema");
const User = require("../models/loginUserModel");
const LessonLMS = require("../models/Lesson");
const Video = require("../models/videoModel");
const Section = require("../models/Section");
const Enrollment = require("../models/enrollment");
const OrderCourse = require("../models/orderCourse");
const UserProgress = require("../models/userProgressSchema");
const TeacherProfile = require("../models/teacherProfile");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utilis/errorHandler");
const { uploadFileToCloudinary } = require("../config/cloudinary");
const axios = require("axios");
const fs = require("fs");
const StandardSubject = require("../models/standardSubjectSchema");
const Standard = require("../models/standardSchema");
/* ================= LIKE / UNLIKE LECTURE ================= */

// ✅ Toggle like/unlike for a lecture/video
const likeOrUnlikeVideo = async (req, res) => {
  try {
    const { courseId, videoId } = req.params; // videoId = lectureId
    const userId = req.user._id;

    // 1️⃣ Validate courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    // 2️⃣ Find course and lecture
    const course = await Course.findOne(
      {
        _id: courseId,
        "sections.lectures._id": videoId,
      },
      {
        sections: 1,
      },
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course or lecture not found",
      });
    }

    // 3️⃣ Locate the lecture
    let targetLecture = null;
    for (const section of course.sections) {
      targetLecture = section.lectures.find(
        (l) => l._id.toString() === videoId,
      );
      if (targetLecture) break;
    }

    if (!targetLecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

    // 4️⃣ Check existing like - USE lectureId NOT videoId
    const existingLike = await Like.findOne({
      user: userId,
      course: courseId,
      lectureId: videoId, // ← CORRECT FIELD NAME
      type: "lecture", // ← CORRECT TYPE
    });

    let liked;
    if (existingLike) {
      // 🔴 UNLIKE
      await Like.deleteOne({ _id: existingLike._id });
      liked = false;
    } else {
      // 🟢 LIKE
      await Like.create({
        user: userId,
        course: courseId,
        lectureId: videoId, // ← CORRECT FIELD NAME
        type: "lecture", // ← CORRECT TYPE
      });
      liked = true;
    }

    // 5️⃣ Get updated like count - USE lectureId
    const likeCount = await Like.countDocuments({
      course: courseId,
      lectureId: videoId, // ← CORRECT FIELD NAME
      type: "lecture", // ← CORRECT TYPE
    });

    // 6️⃣ Respond
    return res.status(200).json({
      success: true,
      liked,
      likeCount,
      lecture: {
        _id: targetLecture._id,
        title: targetLecture.title,
        type: targetLecture.type,
      },
    });
  } catch (error) {
    console.error("Like toggle error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Already liked",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= LIKE / UNLIKE COURSE ================= */

const likeOrUnlikeCourseOnly = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const existingLike = await Like.findOne({
      user: userId,
      course: courseId,
      videoId: null,
      type: "course",
    });

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });

      return res.json({
        success: true,
        liked: false,
        likeCount: await Like.countDocuments({
          course: courseId,
          videoId: null,
        }),
      });
    }

    await Like.create({
      user: userId,
      course: courseId,
      videoId: null,
      type: "course",
    });

    res.json({
      success: true,
      liked: true,
      likeCount: await Like.countDocuments({ course: courseId, videoId: null }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= GET LIKE STATUS ================= */

const getLikeStatus = async (req, res) => {
  const { courseId, videoId } = req.params;
  const userId = req.user._id;

  const like = await Like.findOne({ user: userId, course: courseId, videoId });
  const count = await Like.countDocuments({ course: courseId, videoId });

  res.json({
    success: true,
    liked: !!like,
    likeCount: count,
  });
};

/* ================= GET VIDEO LIKES ================= */

const getVideoLikes = async (req, res) => {
  try {
    const { courseId, videoId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const video = course.videos.id(videoId);
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    const likes = await Like.find({
      course: courseId,
      videoId,
      type: "video",
    }).populate("user", "name email avatar");

    res.json({
      success: true,
      count: likes.length,
      likes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= GET COURSES ================= */
// ✅ Get All Courses with Filters
const getCourses = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;

    let query = { status: "published" }; // 👈 ONLY published courses

    if (category) query.category = category;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const courses = await Course.find(query)
      .populate("instructor", "name email parishImage")
      .limit(Number(limit))
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Single Course by ID
const getCourse = async (req, res) => {
  try {
    const userId = req.user?._id || null;

    // 1️⃣ Fetch course
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email media parishImage")

      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    /* =======================
       ❤️ LIKE LOGIC
    ======================= */

    const likes = await Like.find({ course: course._id }).lean();

    const courseLikes = likes.filter((l) => l.type === "lecture");
    course.courseLikeCount = courseLikes.length;
    course.likedByMe = userId
      ? courseLikes.some((l) => l.user.toString() === userId.toString())
      : false;

    const lectureLikeCount = {};
    const lectureLikedByUser = {};

    likes.forEach((l) => {
      if (l.type === "lecture") {
        const lecId = l.lectureId?.toString();
        if (!lecId) return;

        lectureLikeCount[lecId] = (lectureLikeCount[lecId] || 0) + 1;

        if (userId && l.user.toString() === userId.toString()) {
          lectureLikedByUser[lecId] = true;
        }
      }
    });

    /* =======================
       ⭐ WISHLIST LOGIC
    ======================= */

    const wishlist = await Wishlist.find({ course: course._id }).lean();

    course.wishlistCount = wishlist.length;
    course.wishlistedByMe = userId
      ? wishlist.some((w) => w.user.toString() === userId.toString())
      : false;

    /* =======================
       📤 SHARE LOGIC
    ======================= */

    const shares = await Share.find({ course: course._id }).lean();

    course.shareCount = shares.length;
    course.sharedByMe = userId
      ? shares.some((s) => s.user.toString() === userId.toString())
      : false;

    /* =======================
       📌 MAP TO LECTURES
    ======================= */

    course.sections.forEach((section) => {
      section.lectures.forEach((lecture) => {
        const lecId = lecture._id.toString();
        lecture.likeCount = lectureLikeCount[lecId] || 0;
        lecture.likedByMe = !!lectureLikedByUser[lecId];
      });
    });

    return res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    console.error("getCourse error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ shatr a New Course
// POST /courses/:id/share
const trackCourseShare = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Login required" });
    }

    const { platform } = req.body;
    const courseId = req.params.id;

    const validPlatforms = [
      "copy",
      "facebook",
      "twitter",
      "whatsapp",
      "linkedin",
      "telegram",
    ];
    if (!platform || !validPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        message: `Invalid platform. Valid: ${validPlatforms.join(", ")}`,
      });
    }

    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const share = await Share.create({
      user: userId,
      course: courseId,
      platform,
    });

    res.json({
      success: true,
      message: `Course shared via ${platform}`,
      shareId: share._id,
    });
  } catch (error) {
    console.error("Share tracking error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// ========================
// HELPER FUNCTIONS
// ========================
const safeParse = (value, defaultValue = []) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
};

const validatePricing = (price, discountPrice) => {
  const priceNum = Number(price);
  const discountNum = Number(discountPrice) || 0;

  if (priceNum < 0 || discountNum < 0) {
    throw new Error("Price and discount must be positive values");
  }

  if (discountNum > priceNum) {
    throw new Error("Discount price cannot be greater than regular price");
  }

  return { price: priceNum, discountPrice: discountNum };
};

const validateCourseData = (title, sections) => {
  if (!title || title.trim().length < 5) {
    throw new Error("Course title must be at least 5 characters");
  }

  if (!sections || sections.length === 0) {
    throw new Error("Course must have at least one section");
  }

  // Validate each section
  for (const [index, section] of sections.entries()) {
    if (!section.title || section.title.trim().length < 3) {
      throw new Error(
        `Section ${index + 1} must have a valid title (at least 3 characters)`,
      );
    }

    if (!section.lectures || section.lectures.length === 0) {
      throw new Error(
        `Section "${section.title}" must have at least one lecture`,
      );
    }

    // Validate lectures in section
    for (const [lectureIndex, lecture] of section.lectures.entries()) {
      if (!lecture.title || lecture.title.trim().length < 3) {
        throw new Error(
          `Lecture ${lectureIndex + 1} in section "${
            section.title
          }" must have a title (at least 3 characters)`,
        );
      }

      if (!lecture.videoUrl && !lecture.videoFile) {
        throw new Error(`Lecture "${lecture.title}" must have a URL or file`);
      }

      // Convert duration to number if it's a string
      const duration = Number(lecture.duration);

      if (duration && (duration < 0 || duration > 36000)) {
        throw new Error(
          `Lecture "${lecture.title}" duration must be between 0 and 10 hours`,
        );
      }
    }
  }
};

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 100);
};
//first chapter
const createCourse = async (req, res) => {
  try {
    const instructorId = req.user._id;

    if (!req.user.role?.includes("teacher")) {
      return res.status(403).json({
        success: false,
        message: "Only teachers can create courses",
      });
    }

    const { pageId, title } = req.body;

    // 📁 Handle media (optional)
    const mediaFiles = req.files?.media || [];
    const media = [];

    for (const file of mediaFiles) {
      const uploaded = await uploadFileToCloudinary(file);

      if (uploaded?.url) {
        let type = "image";
        if (file.mimetype.includes("video")) type = "video";
        if (file.mimetype.includes("pdf")) type = "pdf";

        media.push({
          url: uploaded.url,
          type,
          pdfUrl: type === "pdf" ? uploaded.pdfUrl || uploaded.url : null,
        });
      }

      // cleanup temp file
      fs.unlink(file.path, () => {});
    }
    console.log("this is media", media);
    const courseData = {
      title,
      pageId,
      url: media[0].url,
      type: media[0].type,
      instructor: instructorId,
    };

    const newCourse = new Video(courseData);
    await newCourse.save();

    res.status(201).json({
      success: true,
      message: "Course created successfully!",
      course: newCourse,
    });
  } catch (error) {
    console.error("Course creation error:", error);

    res.status(400).json({
      success: false,
      message: error.message || "Failed to create course",
    });
  }
};

// ✅ Create a New Course
// const createCourse = async (req, res) => {
//   try {
//     // Extract all fields from req.body
//     const {
//       title,
//       description,
//       shortDescription,
//       category,
//       subcategory,
//       language,
//       level,
//       thumbnail,
//       promoVideo,
//       price,
//       discountPrice,
//       currency,
//       enrollmentType,
//       sections,
//       prerequisites,
//       targetAudience,
//       learningOutcomes,
//       tags,
//       keywords,
//       isCertified,
//       certificateTemplate,
//       featured,
//       trending,
//       totalDuration,
//       totalLectures,
//       ...rest
//     } = req.body;

//     // Handle media file uploads
//     const mediaFiles = req.files?.media || [];
//     const mediaUrls = [];
//     for (const file of mediaFiles) {
//       const uploaded = await uploadFileToCloudinary(file);
//       if (uploaded?.url) mediaUrls.push(uploaded);
//       fs.unlink(file.path, () => {}); // delete temp file
//     }

//     // Convert tags to array if it's string
//     const tagsArray = Array.isArray(tags)
//       ? tags
//       : typeof tags === "string"
//       ? tags.split(",").map((t) => t.trim())
//       : [];

//     // Create new course with proper structure
//     const newCourse = new Course({
//       title,
//       description,
//       shortDescription,
//       category,
//       subcategory,
//       language,
//       level,
//       media: mediaUrls,
//       promoVideo,
//       price: Number(price),
//       discountPrice: Number(discountPrice),
//       currency,
//       enrollmentType,
//       sections: Array.isArray(sections)
//         ? sections
//         : JSON.parse(sections || "[]"),
//       prerequisites: Array.isArray(prerequisites)
//         ? prerequisites
//         : typeof prerequisites === "string"
//         ? JSON.parse(prerequisites)
//         : [],
//       targetAudience: Array.isArray(targetAudience)
//         ? targetAudience
//         : typeof targetAudience === "string"
//         ? JSON.parse(targetAudience)
//         : [],
//       learningOutcomes: Array.isArray(learningOutcomes)
//         ? learningOutcomes
//         : typeof learningOutcomes === "string"
//         ? JSON.parse(learningOutcomes)
//         : [],
//       tags: tagsArray,
//       keywords,
//       isCertified: isCertified === "true" || isCertified === true,
//       certificateTemplate,
//       featured: featured === "true" || featured === true,
//       trending: trending === "true" || trending === true,
//       totalDuration: Number(totalDuration),
//       totalLectures: Number(totalLectures),
//       instructor: req.user.id,
//     });

//     await newCourse.save();

//     const populatedCourse = await Course.findById(newCourse._id).populate(
//       "instructor",
//       "name email"
//     );

//     res.status(201).json(populatedCourse);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };
// Create order for payment

// const createCourse = async (req, res) => {
//   try {
//     const instructorId = req.user.id;

//     // 1. Simple authorization
//     if (!req.user.roles?.includes("teacher")) {
//       return res.status(403).json({
//         success: false,
//         message: "Only teachers can create courses",
//       });
//     }

//     // 2. Get ALL fields from request body
//     const {
//       title,
//       subtitle = "",
//       shortDescription = "",
//       description,
//       category,
//       subcategory = "",
//       language = "English",
//       level = "Beginner",
//       promoVideo = "",
//       price = 0,
//       discountPrice = 0,
//       currency = "USD",
//       enrollmentType = "paid",
//       isCertified = false,
//       featured = false,
//       trending = false,
//       totalDuration = 0,
//       totalLectures = 0,
//       prerequisites = "[]",
//       targetAudience = "[]",
//       learningOutcomes = "[]",
//       tags = "[]",
//       sections = "[]", // This comes as STRING from frontend!
//       keywords = "[]",
//       certificateTemplate = "",
//     } = req.body;

//     // 3. Validate required fields
//     if (!title || !description || !category) {
//       return res.status(400).json({
//         success: false,
//         message: "Title, description, and category are required",
//       });
//     }

//     // 4. PARSE THE SECTIONS STRING to ARRAY
//     let parsedSections = [];
//     try {
//       parsedSections = JSON.parse(sections);
//     } catch (parseError) {
//       console.error("Failed to parse sections:", parseError);
//       return res.status(400).json({
//         success: false,
//         message: "Invalid sections format. Must be valid JSON array",
//         error: parseError.message,
//       });
//     }

//     // 5. Validate sections array
//     if (!Array.isArray(parsedSections) || parsedSections.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Course must have at least one section with lectures",
//         sectionsCount: parsedSections.length,
//       });
//     }

//     // 6. Parse other array fields
//     const parsedPrerequisites = JSON.parse(prerequisites);
//     const parsedTargetAudience = JSON.parse(targetAudience);
//     const parsedLearningOutcomes = JSON.parse(learningOutcomes);
//     const parsedTags = JSON.parse(tags);
//     const parsedKeywords = JSON.parse(keywords);

//     // 7. Handle file uploads if any
//     let thumbnailUrl = "";
//     if (req.files?.thumbnail) {
//       const thumbnail = req.files.thumbnail[0];
//       const uploaded = await uploadFileToCloudinary(thumbnail);
//       thumbnailUrl = uploaded.url;
//     }
//     // Handle file uploads
//     const mediaFiles = req.files?.media || [];
//     const mediaUrls = [];
//     for (const file of mediaFiles) {
//       const uploaded = await uploadFileToCloudinary(file);
//       if (uploaded?.url) mediaUrls.push(uploaded);

//       // Clean up temp file after upload
//       fs.unlink(file.path, () => {});
//     }
//     // 8. Process sections to match schema
//     const processedSections = parsedSections.map((section, index) => {
//       // Process lectures in each section
//       const processedLectures = (section.lectures || []).map(
//         (lecture, lectureIndex) => {
//           // Remove custom 'id' field if present
//           const { id, ...lectureWithoutId } = lecture;

//           return {
//             type: lecture.type || "video",
//             title: lecture.title?.trim() || `Lecture ${lectureIndex + 1}`,
//             description: lecture.description?.trim() || "",
//             duration: Number(lecture.duration) || 0,
//             contentUrl: lecture.videoUrl || "",
//             isPreview: Boolean(lecture.isPreview),
//             resources: Array.isArray(lecture.resources)
//               ? lecture.resources
//               : [],
//             status: lecture.status || "draft",
//           };
//         },
//       );

//       // Remove custom 'id' from section
//       const { id, ...sectionWithoutId } = section;

//       return {
//         title: section.title?.trim() || `Section ${index + 1}`,
//         description: section.description?.trim() || "",
//         order: index + 1,
//         lectures: processedLectures,
//       };
//     });

//     // 9. Calculate totals if not provided
//     let calculatedTotalDuration = totalDuration;
//     let calculatedTotalLectures = totalLectures;

//     if (!totalDuration || !totalLectures) {
//       calculatedTotalLectures = processedSections.reduce((total, section) => {
//         return total + (section.lectures?.length || 0);
//       }, 0);

//       calculatedTotalDuration = processedSections.reduce((total, section) => {
//         return (
//           total +
//           section.lectures.reduce((sectionTotal, lecture) => {
//             return sectionTotal + (lecture.duration || 0);
//           }, 0)
//         );
//       }, 0);
//     }

//     // 10. Create course object
//     const courseData = {
//       // Core Identity
//       title: title.trim(),
//       subtitle: subtitle.trim(),
//       shortDescription:
//         shortDescription.trim() || description.substring(0, 200),
//       description: description.trim(),
//       category: category.trim(),
//       subcategory: subcategory.trim() || category,
//       language,
//       level,

//       // Media
//       thumbnail: thumbnailUrl,
//       promoVideo: promoVideo.trim(),
//       media: mediaUrls,
//       // Curriculum
//       sections: processedSections,

//       // Pricing
//       price: Math.max(0, Number(price)),
//       discountPrice: Math.max(0, Number(discountPrice)),
//       currency,
//       enrollmentType,

//       // Learning Context
//       prerequisites: Array.isArray(parsedPrerequisites)
//         ? parsedPrerequisites.filter((p) => p && p.trim()).map((p) => p.trim())
//         : [],
//       targetAudience: Array.isArray(parsedTargetAudience)
//         ? parsedTargetAudience.filter((a) => a && a.trim()).map((a) => a.trim())
//         : [],
//       learningOutcomes: Array.isArray(parsedLearningOutcomes)
//         ? parsedLearningOutcomes
//             .filter((o) => o && o.trim())
//             .map((o) => o.trim())
//         : [],
//       tags: Array.isArray(parsedTags)
//         ? parsedTags.filter((t) => t && t.trim()).map((t) => t.trim())
//         : [],

//       // Settings
//       isCertified: Boolean(isCertified),
//       featured: Boolean(featured),
//       trending: Boolean(trending),

//       // Metadata
//       keywords: Array.isArray(parsedKeywords)
//         ? parsedKeywords.filter((k) => k && k.trim()).map((k) => k.trim())
//         : [],
//       certificateTemplate: certificateTemplate.trim(),

//       // Calculated Fields
//       totalDuration: calculatedTotalDuration,
//       totalLectures: calculatedTotalLectures,

//       // Instructor
//       instructor: instructorId,

//       // Status
//       status: "draft",
//     };

//     // 11. Create and save course
//     const newCourse = new Course(courseData);
//     await newCourse.save();

//     // ✅ CREATE SEPARATE VIDEO DOCUMENTS
//     const videoDocuments = [];

//     for (const section of newCourse.sections) {
//       for (const lecture of section.lectures) {
//         const videoDoc = new Video({
//           _id: lecture._id, // Same ID as lecture
//           title: lecture.title,
//           description: lecture.description,
//           courseId: newCourse._id,
//           sectionId: section._id,
//           duration: lecture.duration,
//           videoUrl: lecture.contentUrl,
//           isPreview: lecture.isPreview,
//           status: lecture.status,
//           createdBy: instructorId,
//           userId: instructorId,
//           order: lecture.order || 0,
//         });

//         videoDocuments.push(videoDoc);
//       }
//     }

//     // Save all videos
//     if (videoDocuments.length > 0) {
//       await Video.insertMany(videoDocuments);
//     }
//     // 12. Update instructor stats
//     await User.findByIdAndUpdate(instructorId, {
//       $inc: { "teacherStats.totalCourses": 1 },
//       $push: { coursesCreated: newCourse._id },
//     });

//     // 13. Success response
//     res.status(201).json({
//       success: true,
//       message: "Course created successfully!",
//       data: {
//         course: {
//           id: newCourse._id,
//           title: newCourse.title,
//           sections: newCourse.sections.length,
//           lectures: newCourse.totalLectures,
//           duration: newCourse.totalDuration,
//           status: newCourse.status,
//           createdAt: newCourse.createdAt,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Course creation error:", error);

//     res.status(400).json({
//       success: false,
//       message: error.message || "Failed to create course",
//       error: process.env.NODE_ENV === "development" ? error.stack : undefined,
//     });
//   }
// };

// const addToCourseOrder = async (req, res) => {
//   try {
//     const { standardId } = req.params;
//     const userId = req.user._id;

//     // 0. Authorization
//     if (!req.user.role?.includes("student")) {
//       return res.status(403).json({
//         success: false,
//         error: "Only students can purchase courses",
//       });
//     }

//     // 1. Find course

//     const standard = await Standard.findById(standardId)
//       .populate("createdBy", "name email")
//       .select("standard medium pricing gstPercentage discount media createdBy");

//     if (!standard) {
//       return res.status(404).json({
//         success: false,
//         error: "Standard not found",
//       });
//     }
//     console.log("standard", standard);
//    course.isFree || course.price === 0 || course.enrollmentType === "free";

//     // 4. Block instructor self-purchase
//     if (standard.createdBy._id.toString() === userId.toString()) {
//       return res.status(400).json({
//         success: false,
//         error: "You cannot enroll in your own course",
//       });
//     }

//     // 5. Check existing enrollment
//     const existingEnrollment = await Enrollment.findOne({
//       student: userId,
//       stanard: standardId,
//     });

//     if (existingEnrollment) {
//       if (
//         existingEnrollment.status === "active" &&
//         existingEnrollment.paymentStatus === "paid"
//       ) {
//         return res.status(400).json({
//           success: false,
//           error: "You are already enrolled in this course",
//         });
//       }
//     }

//     // 6. Calculate pricing
//     const plan = "yearly";
//     let basePrice =
//       plan === "yearly" ? standard.pricing.yearly : standard.pricing.monthly;

//     // ---------------- APPLY DISCOUNT ----------------
//     let discountAmount = 0;

//     if (
//       standard.discount &&
//       standard.discount.type &&
//       standard.discount.appliesTo === plan
//     ) {
//       if (standard.discount.type === "percentage") {
//         discountAmount = (basePrice * standard.discount.value) / 100;
//       }

//       if (standard.discount.type === "flat") {
//         discountAmount = standard.discount.value;
//       }

//       basePrice -= discountAmount;
//     }

//     // ---------------- APPLY GST ----------------
//     let gstAmount = 0;
//     let totalAmount = basePrice;

//     if (basePrice > 0) {
//       gstAmount = (basePrice * standard.gstPercentage) / 100;

//       totalAmount = basePrice + gstAmount;

//       gstAmount = Math.round(gstAmount * 100) / 100;
//       totalAmount = Math.round(totalAmount * 100) / 100;
//     }

//     // 7. Generate order ID
//     const orderId = `order_${Date.now()}_${Math.random()
//       .toString(36)
//       .substr(2, 9)}`;

//     // 8. Create Order in database - CORRECTED
//     const orderData = {
//       user: userId,
//       orderId: orderId,

//       items: [
//         {
//           standard: standard._id,
//           standardLevel: standard.standard,
//           medium: standard.medium,
//           plan: plan,
//           price: basePrice,
//           discount: discountAmount,
//           finalPrice: totalAmount,
//         },
//       ],
//       standardId: standardId,
//       subtotal: basePrice,
//       discount: discountAmount,
//       tax: gstAmount,
//       total: totalAmount,
//       currency: "INR",
//       finalAmount: totalAmount,
//       amount: totalAmount,
//       paymentMethod: "razorpay",
//       paymentStatus: "pending",
//       status: "created",

//       billingAddress: {
//         name: req.user.name || "",
//         email: req.user.email,
//         phone: req.user.phone || "",
//       },

//       metadata: {
//         standardId: standard._id.toString(),
//         plan: plan,
//         userId: userId.toString(),
//       },

//       ipAddress: req.ip || req.connection.remoteAddress,
//       userAgent: req.headers["user-agent"] || "",
//       notes: `Enrollment for Standard ${standard.standard} (${standard.medium})`,
//     };

//     const order = await OrderCourse.create(orderData);

//     // 9. Create Enrollment
//     let accessExpiry;

//     if (plan === "monthly") {
//       accessExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
//     } else {
//       const now = new Date();
//       const year = now.getFullYear();
//       const month = now.getMonth() + 1;

//       let endYear;

//       if (month >= 6) {
//         endYear = year + 1;
//       } else {
//         endYear = year;
//       }

//       accessExpiry = new Date(`${endYear}-03-31T23:59:59.999Z`);
//     }

//     const enrollmentData = {
//       student: userId,
//       standard: standardId,
//       plan: plan,
//       order: order._id,
//       enrolledDate: new Date(),

//       paymentStatus: "pending",
//       status: "pending",

//       accessExpiry: accessExpiry,

//       progress: {
//         completedLessons: 0,
//         totalLessons: 0,
//         percentage: 0,
//         lastAccessed: null,
//       },
//     };

//     const enrollment = await Enrollment.create(enrollmentData);

//     // 11. Response

//     const response = {
//       success: true,
//       // message: isFreeCourse
//       //   ? "Successfully enrolled in free course!"
//       //   : "Order created successfully",
//       data: {
//         orderId: order._id,
//         enrollmentId: enrollment._id,
//         standardId: standardId,
//         isFreeCourse: isFreeCourse,
//         // accessStatus: isFreeCourse ? "active" : "pending_payment",
//         enrollmentDate: enrollment.createdAt,
//       },
//     };

//     res.json(response);
//   } catch (error) {
//     console.error("Enrollment error:", error);

//     res.status(500).json({
//       success: false,
//       error:
//         process.env.NODE_ENV === "development"
//           ? error.message
//           : "Failed to process enrollment. Please try again.",
//     });
//   }
// };

const addToCourseOrder = async (req, res) => {
  try {
    const { standardId } = req.params;
    const { plan, paymentMethod = "razorpay", finalPrices } = req.body;
    console.log("plan", plan);
    console.log("finalPrices", finalPrices);

    const userId = req.user._id;

    // 1. Authorization - Only students
    if (!req.user.role?.includes("student")) {
      return res.status(403).json({
        success: false,
        error: "Only students can purchase courses",
      });
    }

    // 2. Validate plan
    if (!["monthly", "yearly"].includes(plan)) {
      return res.status(400).json({
        success: false,
        error: "Invalid plan. Choose 'monthly' or 'yearly'",
      });
    }

    // 3. Find standard
    const standard = await Standard.findById(standardId).select(
      "standard medium pricing gstPercentage discount  createdBy",
    );

    if (!standard) {
      return res.status(404).json({
        success: false,
        error: "Standard not found",
      });
    }

    // 4. Block self-purchase
    if (standard.createdBy.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        error: "You cannot enroll in your own standard",
      });
    }

    // 5. Check existing active enrollment
    const existingEnrollment = await Enrollment.findOne({
      student: userId,
      standard: standardId,
      status: "active",
      $or: [{ paymentStatus: "paid" }, { paymentStatus: "free" }],
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        error: "You are already enrolled in this standard",
        data: {
          enrollmentId: existingEnrollment._id,
          plan: existingEnrollment.plan,
          status: existingEnrollment.status,
          accessExpiry: existingEnrollment.accessExpiry,
        },
      });
    }

    // 6. Calculate pricing
    let basePrice = standard.pricing[plan];

    if (!basePrice || basePrice <= 0) {
      return res.status(400).json({
        success: false,
        error: `No pricing found for ${plan} plan`,
      });
    }

    // Apply discount
    let discountAmount = 0;
    const discount = standard.discount;

    if (discount && discount.appliesTo === plan) {
      if (discount.type === "percentage") {
        discountAmount = (basePrice * discount.value) / 100;
      } else if (discount.type === "flat") {
        discountAmount = discount.value;
      }
    }

    const priceAfterDiscount = basePrice - discountAmount;

    // Apply GST
    let gstAmount = 0;
    let totalAmount = priceAfterDiscount;

    if (priceAfterDiscount > 0) {
      gstAmount = (priceAfterDiscount * standard.gstPercentage) / 100;
      totalAmount = priceAfterDiscount + gstAmount;

      // Round to 2 decimal places
      gstAmount = Math.round(gstAmount * 100) / 100;
      totalAmount = Math.round(totalAmount * 100) / 100;
    }

    // 8. Calculate access expiry date
    let accessExpiry;
    let academicYear = null;

    if (plan === "monthly") {
      // 30 days from now
      accessExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else if (plan === "yearly") {
      // Academic year logic (June-March)
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // Jan = 1

      let academicStartYear, academicEndYear;

      if (currentMonth >= 6) {
        // Purchase between June-Dec: Academic year current year to next year
        academicStartYear = currentYear;
        academicEndYear = currentYear + 1;
      } else {
        // Purchase between Jan-May: Academic year previous year to current year
        academicStartYear = currentYear - 1;
        academicEndYear = currentYear;
      }

      // March 31 of the end year
      accessExpiry = new Date(`${academicEndYear}-03-31T23:59:59.999Z`);

      // Set academic year data
      academicYear = {
        start: academicStartYear,
        end: academicEndYear,
        validTill: accessExpiry,
      };
    }
    console.log("req.userddddddddddddddddddd", req.user);
    // 9. Generate order ID
    const orderId = `ORDER_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // 10. Create Order in database
    const isYearly = plan === "yearly";

    const orderData = {
      user: userId,
      orderId: orderId,
      standardId: standard._id,
      standardLevel: standard.standard,
      medium: standard.medium,

      pricing: {
        plan: plan,

        basePrice: isYearly
          ? finalPrices.yearlyOriginal
          : finalPrices.monthlyOriginal,

        discount: isYearly ? finalPrices.discountAmount : 0,

        discountPercentage: isYearly ? finalPrices.discountPercentage : 0,

        taxableAmount: isYearly
          ? finalPrices.yearlyAfterGST.original
          : finalPrices.monthlyAfterGST.original,

        gstPercentage: finalPrices.gstPercentage,

        gstAmount: isYearly
          ? finalPrices.yearlyAfterGST.gstAmount
          : finalPrices.monthlyAfterGST.gstAmount,

        finalAmount: isYearly ? finalPrices.yearly : finalPrices.monthly,
      },

      currency: "INR",

      paymentMethod,
      paymentStatus: "pending",
      status: "created",

      billingAddress: {
        name: req.user.name || `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email,
        phone: req.user.phone || "",
      },
      subscription: {
        startDate: new Date(),
        endDate: isYearly
          ? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          : new Date(new Date().setMonth(new Date().getMonth() + 1)),
        academicYear,
      },
      ipAddress: req.ip || req.connection.remoteAddress, // ← ADDED
      userAgent: req.headers["user-agent"] || "", // ← ADDED

      notes: `Enrollment for Class ${standard.standard} (${standard.medium}) - ${plan} plan`,
    };

    const order = await OrderCourse.create(orderData);

    // 11. Create PENDING enrollment
    const enrollmentData = {
      student: userId,
      standard: standardId,
      plan: plan,
      order: order._id,
      enrolledDate: new Date(),
      paymentStatus: "pending",
      status: "pending",
      accessExpiry: accessExpiry,
      pricePaid: totalAmount,
      originalPrice: basePrice,
      discountApplied: discountAmount,
      gstAmount: gstAmount,
      academicYear: academicYear,
      isActive: false,
      progress: {
        completedLessons: 0,
        totalLessons: 0,
        percentage: 0,
        lastAccessed: null,
      },
    };

    const enrollment = await Enrollment.create(enrollmentData);

    // 12. Link enrollment to order
    await OrderCourse.findByIdAndUpdate(order._id, {
      enrollmentId: enrollment._id,
    });

    // 13. Response with ALL necessary data for frontend
    res.status(201).json({
      success: true,
      message: "Subscription order created successfully",
      data: {
        // Order details
        order: {
          id: order._id,
          orderId: orderId,
          gatewayOrderId: orderId,
          amount: totalAmount,
          currency: "INR",
          status: order.status,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt,
        },

        // Enrollment details
        enrollment: {
          id: enrollment._id,
          plan: enrollment.plan,
          status: enrollment.status,
          accessExpiry: enrollment.accessExpiry,
          enrolledDate: enrollment.enrolledDate,
        },

        // Standard details
        standard: {
          id: standard._id,
          name: `Class ${standard.standard}`,
          medium: standard.medium,
        },

        // Pricing breakdown
        pricing: {
          originalPrice: basePrice,
          discountAmount: discountAmount,
          priceAfterDiscount: priceAfterDiscount,
          gstAmount: gstAmount,
          gstPercentage: standard.gstPercentage,
          finalAmount: totalAmount,
        },

        // Validity info
        validity: {
          plan: plan,
          accessExpiry: accessExpiry,
          academicYear: academicYear,
          daysValid:
            plan === "monthly"
              ? 30
              : Math.ceil((accessExpiry - new Date()) / (1000 * 60 * 60 * 24)),
        },

        // User info for display
        user: {
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone,
        },
      },
    });
  } catch (error) {
    console.error("Enrollment error:", error);

    // Specific error handling
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: Object.values(error.errors).map((err) => err.message),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Duplicate enrollment detected",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to process enrollment. Please try again.",
      ...(process.env.NODE_ENV === "development" && { debug: error.message }),
    });
  }
};

const getToCourseOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1️⃣ Find latest pending order
    const order = await OrderCourse.findOne({
      user: userId,
      paymentStatus: "pending",
    }).sort({ createdAt: -1 });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "No pending order found",
      });
    }

    // 2️⃣ Find related enrollment
    const enrollment = await Enrollment.findOne({
      order: order._id,
      student: userId,
    });

    res.json({
      success: true,
      message: "Pending order found",
      data: {
        orderId: order._id,
        enrollmentId: enrollment?._id,
        amount: order.finalAmount,
        currency: order.currency,

        // ✅ REQUIRED
        subjectId: order.subjectId,
      },
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch order",
    });
  }
};
// controllers/learningController.js
const getCourseContent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: courseId,
      paymentStatus: "paid",
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        error: "You are not enrolled in this course",
      });
    }

    // Get course with sections and lectures
    const course = await Course.findById(courseId)
      .populate("sections.lectures")
      .populate("instructor", "name email profileImage");

    // Get user progress
    const progress = await UserProgress.findOne({
      user: userId,
      course: courseId,
    });

    res.json({
      success: true,
      course,
      enrollment,
      progress: progress || { completedLectures: [] },
    });
  } catch (error) {
    console.error("Error fetching course content:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
// ✅ Update Course
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.instructor.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    Object.assign(course, req.body);
    await course.save();

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Course
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.instructor.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    // Delete lessons linked to this course
    await LessonLMS.deleteMany({ course: course._id });
    await course.deleteOne();

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Generate VdoCipher OTP
const generateOtp = async (req, res) => {
  try {
    const videoId = req.params.videoId;

    const response = await axios.post(
      `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
      { ttl: 300 },
      {
        headers: {
          Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
        },
      },
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("VdoCipher OTP Error:", error.message);
    res.status(500).json({
      message: "Failed to generate video OTP",
      error: error.message,
    });
  }
};

const addOrRemoveWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // 1️⃣ Validate courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    // 2️⃣ Check if course exists
    const course = await Course.findById(courseId).select("_id title");
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // 3️⃣ Check existing wishlist entry
    const existingWishlist = await Wishlist.findOne({
      user: userId,
      course: courseId,
    });

    let wishlisted;
    if (existingWishlist) {
      // 🔴 Remove from wishlist
      await Wishlist.deleteOne({ _id: existingWishlist._id });
      wishlisted = false;
    } else {
      // 🟢 Add to wishlist
      await Wishlist.create({
        user: userId,
        course: courseId,
      });
      wishlisted = true;
    }

    // 4️⃣ Get updated wishlist count for this course
    const wishlistCount = await Wishlist.countDocuments({
      course: courseId,
    });

    // 5️⃣ Respond
    return res.status(200).json({
      success: true,
      wishlisted,
      wishlistCount,
      course: {
        _id: course._id,
        title: course.title,
      },
    });
  } catch (error) {
    console.error("Wishlist toggle error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const addOrRemoveCourseWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // 1️⃣ Validate courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    // 2️⃣ Check if course exists
    const course = await Course.findById(courseId).select("_id title");
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // 3️⃣ Check existing wishlist entry
    const existingWishlist = await Wishlist.findOne({
      user: userId,
      course: courseId,
    });

    let wishlisted;
    if (existingWishlist) {
      // 🔴 Remove from wishlist
      await Wishlist.deleteOne({ _id: existingWishlist._id });
      wishlisted = false;
    } else {
      // 🟢 Add to wishlist
      await Wishlist.create({
        user: userId,
        course: courseId,
      });
      wishlisted = true;
    }

    // 4️⃣ Get updated wishlist count for this course
    const wishlistCount = await Wishlist.countDocuments({
      course: courseId,
    });

    // 5️⃣ Respond
    return res.status(200).json({
      success: true,
      wishlisted,
      wishlistCount,
      course: {
        _id: course._id,
        title: course.title,
      },
    });
  } catch (error) {
    console.error("Wishlist toggle error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper functions (defined outside the main function)
// const calculateTimeAgo = (date) => {
//   const now = new Date();
//   const diffMs = now - new Date(date);
//   const diffMins = Math.floor(diffMs / 60000);
//   const diffHours = Math.floor(diffMs / 3600000);
//   const diffDays = Math.floor(diffMs / 86400000);

//   if (diffMins < 1) return "Just now";
//   if (diffMins < 60)
//     return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
//   if (diffHours < 24)
//     return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
//   if (diffDays === 1) return "Yesterday";
//   return `${diffDays} days ago`;
// };

// const getLastWatchedLesson = (progressData) => {
//   const lastProgress = progressData
//     .filter((p) => p.completed)
//     .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];

//   return lastProgress
//     ? lastProgress.lessonTitle || "Last watched lesson"
//     : "No lessons watched yet";
// };

// const getCourseRecommendations = async (studentId) => {
//   try {
//     // Get student's enrolled course categories
//     const enrollments = await Enrollment.find({ userId: studentId }).populate(
//       "courseId",
//       "category tags"
//     );

//     const enrolledCategories = enrollments
//       .map((e) => e.courseId?.category)
//       .filter(Boolean);

//     const enrolledTags = enrollments
//       .flatMap((e) => e.courseId?.tags || [])
//       .filter(Boolean);

//     // Find similar courses
//     const recommendations = await Course.find({
//       _id: { $nin: enrollments.map((e) => e.courseId?._id).filter(Boolean) },
//     })
//       .populate("instructor", "name")
//       .limit(2)
//       .select("title instructor thumbnail category tags enrolledCount");

//     return recommendations.map((course, index) => {
//       let match = 70; // Base match percentage
//       let reason = "Recommended for you";

//       // Increase match if same category
//       if (enrolledCategories.includes(course.category)) {
//         match += 15;
//         reason = "Based on your interests";
//       }

//       // Increase match if shared tags
//       const sharedTags = course.tags.filter((tag) =>
//         enrolledTags.includes(tag)
//       ).length;
//       if (sharedTags > 0) {
//         match += sharedTags * 5;
//         reason = "Similar to your enrolled courses";
//       }

//       return {
//         id: course._id,
//         title: course.title,
//         match: Math.min(match, 98), // Cap at 98%
//         reason: reason,
//         instructor: course.instructor?.name,
//         thumbnail: course.thumbnail,
//       };
//     });
//   } catch (error) {
//     console.error("Error getting recommendations:", error);
//     return [];
//   }
// };

// const calculateStudentRank = async (studentId) => {
//   try {
//     const student = await User.findById(studentId);
//     if (!student) return 1;

//     const studentsWithMorePoints = await User.countDocuments({
//       role: "student",
//       points: { $gt: student.points || 0 },
//     });

//     return studentsWithMorePoints + 1;
//   } catch (error) {
//     console.error("Error calculating rank:", error);
//     return 1;
//   }
// };
const getStudentProfile = catchAsyncError(async (req, res, next) => {
  const studentId = req.user._id;

  // Fetch student/user details
  const student = await User.findById(studentId);
  if (!student) {
    return next(new ErrorHandler("Student not found", 404));
  }

  // Fetch enrollments and related course data
  const enrollments = await Enrollment.find({ student: studentId }).populate({
    path: "course",
    populate: [
      { path: "instructor", select: "name email parishImage" },
      {
        path: "sections",
        populate: {
          path: "lessons",
          model: "LessonLMS",
        },
      },
    ],
  });

  // Fetch user progress data
  const userProgress = await UserProgress.find({ user: studentId });

  // Calculate academic stats from enrollments
  const enrolledCourses = enrollments.length;
  const completedCourses = enrollments.filter(
    (e) => e.status === "completed",
  ).length;
  const inProgressCourses = enrollments.filter(
    (e) => e.status === "active",
  ).length;

  // Fetch certificates
  const certificates = enrollments
    .filter((e) => e.certificateId)
    .map((e) => ({
      id: e.certificateId,
      name: e.certificateName || `${e.course?.title || "Course"} Certificate`,
      course: e.course?.title || "Unknown Course",
      issueDate: e.completedDate || e.updatedAt.toISOString().split("T")[0],
      certificateId: e.certificateId,
      downloadUrl: `/certificates/${e.certificateId}.pdf`,
    }));

  // Fetch assessment data from user progress
  const assessmentData = userProgress
    .filter(
      (up) => up.assessmentScore !== undefined && up.assessmentScore !== null,
    )
    .map((up) => ({
      id: up._id,
      type: up.assessmentType || "Quiz",
      title: up.lessonTitle || "Assessment",
      score: up.assessmentScore,
      total: up.assessmentTotal || 100,
      status: up.assessmentScore >= 70 ? "Passed" : "Failed",
      date: up.completedAt
        ? up.completedAt.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      instructorFeedback: up.feedback || "No feedback yet",
    }));

  // Calculate learning stats
  const learningStats = userProgress.reduce((stats, progress) => {
    stats.totalLearningTime =
      (stats.totalLearningTime || 0) + (progress.timeSpent || 0);
    stats.lessonsWatched =
      (stats.lessonsWatched || 0) + (progress.completed ? 1 : 0);
    stats.quizzesAttempted =
      (stats.quizzesAttempted || 0) + (progress.assessmentTaken ? 1 : 0);

    if (progress.assessmentScore) {
      stats.totalScore = (stats.totalScore || 0) + progress.assessmentScore;
      stats.scoreCount = (stats.scoreCount || 0) + 1;
    }

    return stats;
  }, {});

  // Calculate average score
  if (learningStats.scoreCount > 0) {
    learningStats.averageScore =
      Math.round((learningStats.totalScore / learningStats.scoreCount) * 10) /
      10;
  }

  // Find last active time
  const lastProgress = await UserProgress.findOne({ user: studentId }).sort({
    updatedAt: -1,
  });

  learningStats.lastActive = lastProgress
    ? calculateTimeAgo(lastProgress.updatedAt)
    : "Never";

  // Fetch badges/achievements
  const badges = student.achievements || [];

  // Format enrolled courses with progress
  const formattedCourses = enrollments
    .map((enrollment) => {
      const course = enrollment.course;

      if (!course) {
        return null;
      }

      const courseProgress = userProgress.filter(
        (up) => up.course && up.course.toString() === course._id.toString(),
      );

      const totalLessons =
        course.sections?.reduce(
          (sum, section) => sum + (section.lessons?.length || 0),
          0,
        ) || 0;

      const completedLessons = courseProgress.filter(
        (up) => up.completed,
      ).length;
      const progress =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      return {
        id: course._id,
        title: course.title,
        instructor: course.instructor?.name || "Unknown Instructor",
        progress: progress,
        lastWatched: getLastWatchedLesson(courseProgress),
        status: enrollment.status || "in-progress",
        thumbnail: course.thumbnail || "/assets/courses/default.jpg",
        duration: course.duration || "8 weeks",
        lessonsCompleted: completedLessons,
        totalLessons: totalLessons,
        certificateId: enrollment.certificateId || null,
      };
    })
    .filter((course) => course !== null);

  // Calculate engagement stats
  const engagementStats = {
    doubtsAsked: 0,
    forumPosts: 0,
    comments: 0,
    instructorReplies: 0,
  };

  // Fetch payment history from OrderCourse
  const paymentHistory = await OrderCourse.find({ user: studentId })
    .select("createdAt total status")
    .sort({ createdAt: -1 });

  // Security and subscription info
  const securityInfo = {
    lastLoginIp: student.lastLoginIp || "Unknown",
    loginHistory: student.loginHistory || [],
    subscriptionStatus: student.subscriptionStatus || "Active",
    paymentHistory: paymentHistory.map((payment) => ({
      date: payment.createdAt.toISOString().split("T")[0],
      amount: `${payment.currency || "INR"} ${payment.total || 0}`,
      status: payment.status || "Pending",
    })),
  };

  // Recommendations based on enrolled courses
  const recommendations = await getCourseRecommendations(studentId);

  // Leaderboard position - FIXED: Use 'roles' not 'role'
  let rank = 1;
  let totalStudents = 0;

  try {
    rank = await calculateStudentRank(studentId);
    totalStudents = await User.countDocuments({
      roles: { $in: ["student"] }, // ← FIXED: Use 'roles' array field
    });
  } catch (error) {
    console.error("Leaderboard calculation error:", error);
    // Use defaults on error
    totalStudents = await User.estimatedDocumentCount(); // Fallback
  }

  const leaderboard = {
    rank: rank,
    totalStudents: totalStudents,
    points: student.points || 0,
  };

  // Build final response
  const studentProfile = {
    id: student._id,
    fullName:
      student.name ||
      `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
      student.username ||
      "Unknown User",
    email: student.email,
    phone: student.phone || "+1 (555) 123-4567",
    studentId:
      student.studentId ||
      `STU${student._id.toString().slice(-6).toUpperCase()}`,
    roles: student.roles || (student.roles && student.roles[0]) || "Student", // Show first role from array
    status: student.status || "Active",
    joinedDate: student.createdAt
      ? student.createdAt.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    profileImage: student.parishImage || "/assets/students/default.jpg",
    currentGrade: student.grade || "Not Specified",
    stream: student.stream || "General",

    academicStats: {
      enrolledCourses: enrolledCourses,
      completedCourses: completedCourses,
      inProgressCourses: inProgressCourses,
      certificatesEarned: certificates.length,
    },

    enrolledCourses: formattedCourses,

    learningStats: {
      totalLearningTime: Math.round(
        (learningStats.totalLearningTime || 0) / 60,
      ),
      lastActive: learningStats.lastActive,
      lessonsWatched: learningStats.lessonsWatched || 0,
      quizzesAttempted: learningStats.quizzesAttempted || 0,
      averageScore: learningStats.averageScore || 0,
    },

    assessments: assessmentData,

    certificates: certificates,

    engagementStats: engagementStats,

    securityInfo: securityInfo,

    recommendations: recommendations,

    badges: badges,

    leaderboard: leaderboard,
  };

  res.status(200).json({
    success: true,
    data: studentProfile,
  });
});
const getTeacherProfile = catchAsyncError(async (req, res, next) => {
  const teacherId = req.user._id;
  console.log("teacherId", teacherId);
  // Fetch teacher/user details
  // const teacher = await User.findById({ id: teacherId });
  // if (!teacher) {
  //   return next(new ErrorHandler("Teacher not found", 404));
  // }

  // Fetch teacher profile data
  const teacherProfile = await TeacherProfile.findOne({ user: teacherId })
    .populate({
      path: "user",
      select:
        "name email parishImage dateOfBirth address1 address2 address3 city country district postalCode state town village phoneNumber",
    })
    .populate({
      path: "application.reviewedBy",
      select: "name email role",
    })
    .populate({
      path: "verification.verifiedBy",
      select: "name email role",
    })
    .lean();

  // Check if profile exists
  if (!teacherProfile) {
    return next(new ErrorHandler("Teacher profile not found", 404));
  }

  res.status(200).json({
    success: true,
    data: teacherProfile, // Fixed: should be teacherProfile, not studentProfile
  });
});
// Helper functions
const calculateTimeAgo = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60)
    return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
};

const getLastWatchedLesson = (progressData) => {
  if (
    !progressData ||
    !Array.isArray(progressData) ||
    progressData.length === 0
  ) {
    return "No lessons watched yet";
  }

  // Filter completed lessons and find the most recent
  const completedLessons = progressData.filter((p) => p.completed);
  if (completedLessons.length === 0) {
    return "No lessons completed yet";
  }

  // Sort by last watched/completion date
  const lastLesson = completedLessons.sort((a, b) => {
    const dateA = new Date(
      a.lastWatchedAt || a.completedAt || a.updatedAt || 0,
    );
    const dateB = new Date(
      b.lastWatchedAt || b.completedAt || b.updatedAt || 0,
    );
    return dateB - dateA;
  })[0];

  return `Last watched: ${lastLesson.lecture || "Lesson"}`;
};

const getCourseRecommendations = catchAsyncError(async (studentId) => {
  try {
    // Get student's enrolled course categories
    const enrollments = await Enrollment.find({
      student: studentId,
    }).populate("course", "category tags");

    // If no enrollments, return empty array
    if (enrollments.length === 0) {
      return [];
    }

    const enrolledCategories = enrollments
      .map((e) => e.course?.category)
      .filter(Boolean);

    const enrolledTags = enrollments
      .flatMap((e) => e.course?.tags || [])
      .filter(Boolean);

    // Find similar courses not already enrolled
    const enrolledCourseIds = enrollments
      .map((e) => e.course?._id)
      .filter(Boolean);

    const recommendations = await Course.find({
      _id: { $nin: enrolledCourseIds },
      status: "published",
    })
      .populate("instructor", "name")
      .limit(3)
      .select("title instructor thumbnail category tags enrolledCount");

    return recommendations.map((course) => {
      let match = 70;
      let reason = "Recommended for you";

      if (enrolledCategories.includes(course.category)) {
        match += 15;
        reason = "Based on your interests";
      }

      const sharedTags =
        course.tags?.filter((tag) => enrolledTags.includes(tag)).length || 0;

      if (sharedTags > 0) {
        match += sharedTags * 5;
        reason = "Similar to your enrolled courses";
      }

      return {
        id: course._id,
        title: course.title,
        match: Math.min(match, 98),
        reason: reason,
        instructor: course.instructor?.name,
        thumbnail: course.thumbnail,
      };
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    return [];
  }
});

const calculateStudentRank = catchAsyncError(async (studentId) => {
  try {
    const student = await User.findById(studentId);
    if (!student) return 1;

    const studentPoints = Number(student.points) || 0;

    // Use 'roles' array field for query
    const studentsWithMorePoints = await User.countDocuments({
      roles: { $in: ["student"] },
      points: { $gt: studentPoints },
    });

    return studentsWithMorePoints + 1;
  } catch (error) {
    console.error("Rank calculation error:", error);
    return 1;
  }
});

// ✅ Export all functions
module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  generateOtp,
  likeOrUnlikeVideo,
  getLikeStatus,
  getVideoLikes,
  likeOrUnlikeCourseOnly,
  addOrRemoveWishlist,
  trackCourseShare,
  addOrRemoveCourseWishlist,
  addToCourseOrder,
  getToCourseOrder,
  getCourseContent,
  getStudentProfile,
  getTeacherProfile,
};
