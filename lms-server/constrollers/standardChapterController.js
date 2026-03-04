const StandardChapter = require("../models/standardChapterScheema");
const StandardPage = require("../models/StandardPageScheema");
const StandardSubject = require("../models/standardSubjectSchema");
const Standard = require("../models/standardSchema");
const { uploadFileToCloudinary } = require("../config/cloudinary");
const User = require("../models/loginUserModel");
const fs = require("fs");

// @desc    Create a new chapter
// @route   POST /api/chapters
// @access  Private
exports.createStandardChapter = async (req, res) => {
  try {
    const { standardSubject, chapterNumber, chapterTitle, description, part } =
      req.body;

    // 🔴 BASIC VALIDATION
    if (!standardSubject || !chapterNumber || !chapterTitle) {
      return res.status(400).json({
        success: false,
        message: "standardSubject, chapterNumber and chapterTitle are required",
      });
    }

    // 🔴 CHECK SUBJECT EXISTS
    const subjectExists = await StandardSubject.findById(standardSubject);
    if (!subjectExists) {
      return res.status(404).json({
        success: false,
        message: "StandardSubject not found",
      });
    }

    // 🔴 CHECK DUPLICATE CHAPTER NUMBER FOR SAME SUBJECT
    const existingChapter = await StandardChapter.findOne({
      subjectId: standardSubject,
      chapterNumber: Number(chapterNumber),
    });

    if (existingChapter) {
      return res.status(400).json({
        success: false,
        message: `Chapter ${chapterNumber} already exists for this subject`,
      });
    }

    // 🔹 UPLOAD MEDIA (OPTIONAL)
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

    // 🔹 CREATE CHAPTER
    const chapter = await StandardChapter.create({
      subjectId: standardSubject,
      chapterNumber: Number(chapterNumber),
      chapterTitle: chapterTitle.trim(),
      description: description?.trim(),
      part: part?.trim(),
      media,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Chapter created successfully",
      data: chapter,
    });
  } catch (error) {
    console.error("Create Chapter error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get all chapters with pagination and filtering
// @route   GET /api/chapters
// @access  Public
exports.getAllStandardChapter = async (req, res) => {
  try {
    // Extract query parameters
    const { subjectId, standard, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = {};
    if (subjectId) filter.subjectId = subjectId;
    if (standard) filter.standard = standard;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population
    const chapters = await StandardChapter.find(filter)
      .populate("subjectId", "standard subjects")
      .populate("createdBy", "name email")
      .sort({ chapterNumber: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await StandardChapter.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: chapters.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: chapters,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get chapters by subject ID
// @route   GET /api/chapters/subject/:subjectId
// @access  Public
// exports.getChaptersBySubject = async (req, res) => {
//   try {
//     const { subjectId } = req.params;
//     const { page = 1, limit = 20 } = req.query;

//     // Check if subject exists
//     const subject = await StandardSubject.findById(subjectId);
//     if (!subject) {
//       return res.status(404).json({
//         success: false,
//         message: "Subject not found",
//       });
//     }

//     // Calculate pagination
//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     // Get chapters for this subject
//     const chapters = await StandardChapter.find({ subjectId })
//       .populate("createdBy", "name email")
//       .sort({ chapterNumber: 1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await StandardChapter.countDocuments({ subjectId });

//     res.status(200).json({
//       success: true,
//       subject: {
//         _id: subject._id,
//         standard: subject.standard,
//         subjects: subject.subjects,
//       },
//       count: chapters.length,
//       total,
//       totalPages: Math.ceil(total / parseInt(limit)),
//       currentPage: parseInt(page),
//       data: chapters,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// };

// @desc    Get single chapter by ID
// @route   GET /api/chapters/:id
// @access  Public
// exports.getChaptersBySubject = async (req, res) => {
//   try {
//     const { subjectId } = req.params;

//     // 🔴 Validate subject exists
//     const subjectExists = await StandardSubject.findById(subjectId);
//     if (!subjectExists) {
//       return res.status(404).json({
//         success: false,
//         message: "StandardSubject not found",
//       });
//     }

//     // 🔹 Get all chapters under this subject
//     const chapters = await StandardChapter.find({
//       subjectId: subjectId,
//       isActive: true,
//     })
//       .sort({ chapterNumber: 1 }) // textbook order
//       .populate("subjectId", "standard subject part")
//       .populate("createdBy", "name email");

//     res.status(200).json({
//       success: true,
//       total: chapters.length,
//       data: chapters,
//     });
//   } catch (error) {
//     console.error("Get chapters by subject error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// };
exports.getChaptersBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subjectExists = await StandardSubject.findById(subjectId);
    if (!subjectExists) {
      return res.status(404).json({
        success: false,
        message: "StandardSubject not found",
      });
    }

    // 1️⃣ Get chapters
    const chapters = await StandardChapter.find({
      subjectId,
      isActive: true,
    })
      .sort({ chapterNumber: 1 })
      .populate("subjectId", "standard subject part")
      .populate("createdBy", "name email");

    // 2️⃣ Get page count grouped by chapterId
    const pageCounts = await StandardPage.aggregate([
      {
        $match: { subjectId: subjectExists._id },
      },
      {
        $group: {
          _id: "$chapterId",
          totalPages: { $sum: 1 },
        },
      },
    ]);

    // 3️⃣ Convert to map for fast lookup
    const pageCountMap = {};
    pageCounts.forEach((item) => {
      pageCountMap[item._id.toString()] = item.totalPages;
    });

    // 4️⃣ Attach totalPages to each chapter
    const chaptersWithPageCount = chapters.map((chapter) => ({
      ...chapter.toObject(),
      totalPages: pageCountMap[chapter._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      total: chaptersWithPageCount.length,
      data: chaptersWithPageCount,
    });
  } catch (error) {
    console.error("Get chapters by subject error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
// @access  Public
exports.getChaptersBySubjectRate = async (req, res) => {
  try {
    const { subjectId } = req.params;

    // 🔴 Validate subject exists
    const chapterExists = await StandardChapter.findById(subjectId);
    if (!chapterExists) {
      return res.status(404).json({
        success: false,
        message: "StandardChapter not found",
      });
    }
    const subjectIdNow = chapterExists.chapterExists;
    // 🔹 Get all chapters under this subject
    const chapters = await StandardSubject.find({
      subjectId: subjectIdNow,
    });
    console.log("chapterschapters", chapters);
    if (!chapters.length) {
      return res.status(404).json({ message: "No chapters found" });
    }

    const standard = await Standard.findById(chapters[0].standardId);

    res.status(200).json({
      success: true,

      data: standard,
    });
  } catch (error) {
    console.error("Get chapters by subject error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
exports.getTeacherAndStudentsAndSubjectBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    // 1️⃣ Get subject with teacher
    const subject = await StandardSubject.findById(subjectId)
      .populate("createdBy", "fullName email")
      .select("name standard createdBy");

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // 🔥 IMPORTANT FIX HERE
    const standardAsString = String(subject.standard);

    // 2️⃣ Get students using `std`
    const students = await User.find({
      std: standardAsString,
      isActive: true,
    }).select("name email std  primaryStudents _id");

    // 3️⃣ Response
    res.status(200).json({
      success: true,
      data: {
        subject: {
          id: subject._id,
          name: subject.name,
          standard: subject.standard,
        },
        teacher: subject.createdBy
          ? {
              id: subject.createdBy._id,
              name: subject.createdBy.fullName,
              email: subject.createdBy.email,
            }
          : null,
        students: students.map((student) => ({
          id: student._id,
          name: student.name,
          email: student.email,
          std: student.std,
          primaryStudents: student.primaryStudents,
        })),
        totalStudents: students.length,
      },
    });
  } catch (error) {
    console.error("Get teacher & students by subject error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update chapter
// @route   PUT /api/chapters/:id
// @access  Private
exports.updateChapter = async (req, res) => {
  try {
    const { chapterNumber, chapterTitle, description, id } = req.body;
    const chapterId = req.params.id;

    // Find chapter
    let chapter = await StandardChapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      });
    }

    // Check duplicate chapter number if updating
    if (chapterNumber && Number(chapterNumber) !== chapter.chapterNumber) {
      const existingChapter = await StandardChapter.findOne({
        subjectId: chapter.subjectId,
        chapterNumber: Number(chapterNumber),
        _id: { $ne: chapterId },
      });

      if (existingChapter) {
        return res.status(400).json({
          success: false,
          message: `Chapter ${chapterNumber} already exists for this subject`,
        });
      }
    }
    console.log("req.files", req.files);
    // Handle media upload if any
    const mediaFiles = req.files?.media || [];
    const newMedia = [];

    for (const file of mediaFiles) {
      const uploaded = await uploadFileToCloudinary(file);

      if (uploaded?.url) {
        let type = "image";
        if (file.mimetype.includes("video")) type = "video";
        if (file.mimetype.includes("pdf")) type = "pdf";

        newMedia.push({
          url: uploaded.url,
          type,
          pdfUrl: type === "pdf" ? uploaded.pdfUrl || uploaded.url : null,
        });
      }

      fs.unlink(file.path, () => {});
    }

    // Prepare update data
    const updateData = {};
    if (chapterNumber) updateData.chapterNumber = Number(chapterNumber);
    if (chapterTitle) updateData.chapterTitle = chapterTitle.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (part !== undefined) updateData.part = part.trim();

    // Add new media if any
    if (newMedia.length > 0) {
      updateData.$push = { media: { $each: newMedia } };
    }

    // Update chapter
    chapter = await StandardChapter.findByIdAndUpdate(chapterId, updateData, {
      new: true,
      runValidators: true,
    }).populate("subjectId", "standard subjects");

    res.status(200).json({
      success: true,
      message: "Chapter updated successfully",
      data: chapter,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Delete chapter
// @route   DELETE /api/chapters/:id
// @access  Private
exports.deleteChapter = async (req, res) => {
  try {
    const chapter = await StandardChapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      });
    }

    await chapter.deleteOne();

    res.status(200).json({
      success: true,
      message: "Chapter deleted successfully",
      data: {},
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Add media to chapter
// @route   POST /api/chapters/:id/media
// @access  Private
exports.addMediaToChapter = async (req, res) => {
  try {
    const chapter = await StandardChapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      });
    }

    // Upload media file
    const mediaFiles = req.files?.media || [];
    const newMedia = [];

    for (const file of mediaFiles) {
      const uploaded = await uploadFileToCloudinary(file);

      if (uploaded?.url) {
        let type = "image";
        if (file.mimetype.includes("video")) type = "video";
        if (file.mimetype.includes("pdf")) type = "pdf";

        newMedia.push({
          url: uploaded.url,
          type,
          pdfUrl: type === "pdf" ? uploaded.pdfUrl || uploaded.url : null,
        });
      }

      fs.unlink(file.path, () => {});
    }

    if (newMedia.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid media files uploaded",
      });
    }

    // Add media to chapter
    chapter.media.push(...newMedia);
    await chapter.save();

    res.status(200).json({
      success: true,
      message: "Media added successfully",
      data: chapter.media,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Remove media from chapter
// @route   DELETE /api/chapters/:id/media/:mediaId
// @access  Private
exports.removeMediaFromChapter = async (req, res) => {
  try {
    const chapter = await StandardChapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      });
    }

    // Find media index
    const mediaIndex = chapter.media.findIndex(
      (media) => media._id.toString() === req.params.mediaId,
    );

    if (mediaIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    // Remove media
    chapter.media.splice(mediaIndex, 1);
    await chapter.save();

    res.status(200).json({
      success: true,
      message: "Media removed successfully",
      data: chapter.media,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
