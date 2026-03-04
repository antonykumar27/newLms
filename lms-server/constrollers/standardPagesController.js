const StandardChapter = require("../models/standardChapterScheema");
const StandardSubject = require("../models/standardSubjectSchema");
const StandardPage = require("../models/StandardPageScheema");
const { uploadFileToCloudinary } = require("../config/cloudinary");
const fs = require("fs");

// @desc    Create multiple pages for a specific chapter
// @route   POST /api/pages
// @access  Private

exports.createStandardChapter = async (req, res) => {
  try {
    const { standardSubject, chapterNumber, chapterTitle, description, part } =
      req.body;

    // 🔴 VALIDATION
    if (!standardSubject || !chapterNumber || !chapterTitle) {
      return res.status(400).json({
        success: false,
        message: "standardSubject, chapterNumber and chapterTitle are required",
      });
    }

    // 🔴 CHECK SUBJECT EXISTS
    const subject = await StandardSubject.findById(standardSubject);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "StandardSubject not found",
      });
    }

    // 🔴 DUPLICATE CHECK (subject + chapterNumber)
    const exists = await StandardChapter.findOne({
      subjectId: standardSubject,
      chapterNumber: Number(chapterNumber),
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Chapter number already exists for this subject",
      });
    }

    // 🔹 MEDIA UPLOAD (OPTIONAL)
    const mediaFiles = req.files?.media || [];
    const media = [];

    for (const file of mediaFiles) {
      const uploaded = await uploadFileToCloudinary(file);

      media.push({
        url: uploaded.url,
        type: uploaded.type,
        pdfUrl: uploaded.pdfUrl || null,
      });

      fs.unlink(file.path, () => {});
    }

    // 🔹 CREATE CHAPTER
    const chapter = await StandardChapter.create({
      subjectId: standardSubject,
      chapterNumber: Number(chapterNumber),
      chapterTitle: chapterTitle.trim(),
      description: description?.trim() || "",
      part: part || subject.part || null,
      media,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Chapter created successfully",
      data: chapter,
    });
  } catch (error) {
    console.error("Create Chapter Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate chapter detected",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get all pages for a specific chapter
// @route   GET /api/pages/chapter/:chapterId
// @access  Public
exports.getPagesByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if chapter exists and get subject info
    const chapter = await StandardChapter.findById(chapterId).populate(
      "subjectId",
      "standard subjects",
    );

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      });
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get pages for this chapter
    const pages = await StandardPage.find({ chapterId })
      .populate("subjectId", "standard subjects")
      .populate("chapterId", "chapterNumber chapterTitle")
      .populate("createdBy", "name email")
      .sort({ pageNumber: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StandardPage.countDocuments({ chapterId });

    res.status(200).json({
      success: true,
      chapter: {
        _id: chapter._id,
        chapterNumber: chapter.chapterNumber,
        chapterTitle: chapter.chapterTitle,
        subjectId: chapter.subjectId._id,
        subjectName: chapter.subjectId.subjects,
        standard: chapter.subjectId.standard,
      },
      count: pages.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: pages,
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

// @desc    Get single page by ID
// @route   GET /api/pages/:id
// @access  Public

exports.getPageById = async (req, res) => {
  try {
    /* ---------- 1. GET PARAMETER ---------- */
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Chapter ID is required",
      });
    }

    /* ---------- 2. FIND CHAPTER ---------- */
    const chapter = await StandardChapter.findById(id).populate(
      "subjectId",
      "subjects standard part",
    );

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      });
    }

    /* ---------- 3. FIND ALL PAGES RELATED TO THIS CHAPTER ---------- */
    const pages = await StandardPage.find({ chapterId: chapter._id }).sort({
      pageNumber: 1,
    });

    /* ---------- 4. RESPONSE ---------- */
    res.status(200).json({
      success: true,
      message: "Chapter with related pages fetched successfully",
      data: {
        chapter: {
          _id: chapter._id,
          chapterNumber: chapter.chapterNumber,
          chapterTitle: chapter.chapterTitle,
          media: chapter.media,
          totalPages: pages.length,
          estimatedDuration: chapter.estimatedDuration,
          isActive: chapter.isActive,
          createdAt: chapter.createdAt,
          updatedAt: chapter.updatedAt,
        },
        subject: {
          _id: chapter.subjectId._id,
          subjects: chapter.subjectId.subjects,
          standard: chapter.subjectId.standard,
          part: chapter.subjectId.part || [],
        },
        pages: pages,
      },
    });
  } catch (error) {
    console.error("Get Pages Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
exports.getSinglePageById = async (req, res) => {
  try {
    const { id } = req.params;

    const chapter = await StandardChapter.findById(id);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      });
    }

    res.status(200).json({
      success: true,
      data: chapter,
    });
  } catch (error) {
    console.error("Get chapter by id error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Get pages with filtering
// @route   GET /api/pages
// @access  Public
exports.getAllPages = async (req, res) => {
  try {
    const {
      subjectId,
      chapterId,
      pageNumber,
      page = 1,
      limit = 20,
    } = req.query;

    // Build filter
    const filter = {};
    if (subjectId) filter.subjectId = subjectId;
    if (chapterId) filter.chapterId = chapterId;
    if (pageNumber) filter.pageNumber = Number(pageNumber);

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get pages with population
    const pages = await StandardPage.find(filter)
      .populate("subjectId", "subjects standard")
      .populate("chapterId", "chapterNumber chapterTitle")
      .populate("createdBy", "name email")
      .sort({ pageNumber: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await StandardPage.countDocuments(filter);

    // Get subject and chapter info if specific filters are provided
    let additionalInfo = {};
    if (subjectId) {
      const subject = await StandardSubject.findById(subjectId);
      if (subject) {
        additionalInfo.subject = {
          _id: subject._id,
          subjects: subject.subjects,
          standard: subject.standard,
        };
      }
    }

    if (chapterId) {
      const chapter = await StandardChapter.findById(chapterId).populate(
        "subjectId",
        "subjects standard",
      );
      if (chapter) {
        additionalInfo.chapter = {
          _id: chapter._id,
          chapterNumber: chapter.chapterNumber,
          chapterTitle: chapter.chapterTitle,
        };
      }
    }

    res.status(200).json({
      success: true,
      count: pages.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      ...additionalInfo,
      data: pages,
    });
  } catch (error) {
    console.error("Get All Pages Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update page
// @route   PUT /api/pages/:id
// @access  Private
exports.updatePage = async (req, res) => {
  try {
    const { pageNumber, pageTitle, description } = req.body;
    const pageId = req.params.id;

    // Find page with chapter info
    let page = await StandardPage.findById(pageId).populate(
      "chapterId",
      "chapterTitle",
    );

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    // Check duplicate page number if updating
    if (pageNumber && Number(pageNumber) !== page.pageNumber) {
      const existingPage = await StandardPage.findOne({
        chapterId: page.chapterId,
        pageNumber: Number(pageNumber),
        _id: { $ne: pageId },
      });

      if (existingPage) {
        return res.status(400).json({
          success: false,
          message: `Page number ${pageNumber} already exists in this chapter`,
        });
      }
    }

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
    if (pageNumber) updateData.pageNumber = Number(pageNumber);
    if (pageTitle) updateData.pageTitle = pageTitle.trim();
    if (description !== undefined) updateData.description = description.trim();

    // Add new media if any
    if (newMedia.length > 0) {
      updateData.$push = { media: { $each: newMedia } };
    }

    // Update page
    page = await StandardPage.findByIdAndUpdate(pageId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("subjectId", "standard subjects")
      .populate("chapterId", "chapterNumber chapterTitle");

    res.status(200).json({
      success: true,
      message: "Page updated successfully",
      data: page,
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
exports.updateChapter = async (req, res) => {
  try {
    const { chapterNumber, chapterTitle, description, part } = req.body;
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
// @desc    Delete page
// @route   DELETE /api/pages/:id
// @access  Private
exports.deletePage = async (req, res) => {
  try {
    const page = await StandardPage.findById(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    const chapterId = page.chapterId;

    await page.deleteOne();

    // Decrement page count in chapter
    await StandardChapter.findByIdAndUpdate(chapterId, {
      $inc: {
        pageCount: -1,
        totalPages: -1,
      },
    });

    res.status(200).json({
      success: true,
      message: "Page deleted successfully",
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

// @desc    Get pages by subject
// @route   GET /api/pages/subject/:subjectId
// @access  Public
exports.getPagesBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { page = 1, limit = 30 } = req.query;

    // Check if subject exists
    const subject = await StandardSubject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get all pages for this subject
    const pages = await StandardPage.find({ subjectId })
      .populate("chapterId", "chapterNumber chapterTitle")
      .populate("createdBy", "name email")
      .sort({ "chapterId.chapterNumber": 1, pageNumber: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StandardPage.countDocuments({ subjectId });

    res.status(200).json({
      success: true,
      subject: {
        _id: subject._id,
        standard: subject.standard,
        subjects: subject.subjects,
      },
      count: pages.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: pages,
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

// @desc    Get all pages with filtering
// @route   GET /api/pages
// @access  Public
exports.getAllPages = async (req, res) => {
  try {
    const { subjectId, chapterId, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = {};
    if (subjectId) filter.subjectId = subjectId;
    if (chapterId) filter.chapterId = chapterId;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get pages
    const pages = await StandardPage.find(filter)
      .populate("subjectId", "standard subjects")
      .populate("chapterId", "chapterNumber chapterTitle")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StandardPage.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: pages.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: pages,
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
