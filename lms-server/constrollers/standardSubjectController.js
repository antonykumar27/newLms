const StandardSubject = require("../models/standardSubjectSchema");
const TeacherProfile = require("../models/teacherProfile");
const { uploadFileToCloudinary } = require("../config/cloudinary");
const fs = require("fs");
// @desc    Get all standard subjects
// @route   GET /api/standard-subjects
// @access  Public/Private (adjust as needed)
//Keep for if need student
exports.getAllStandardSubjectsForStudent = async (req, res) => {
  try {
    const user = req.user._id;
    const { std, primaryStudents, medium } = req.user;

    const query =
      primaryStudents === "primaryStudent"
        ? {
            ...(std && { standard: std }),
            ...(medium && { medium }),
          }
        : {
            ...(medium && { medium }),
          };

    const standardSubjects = await StandardSubject.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: standardSubjects.length,
      data: standardSubjects,
    });
  } catch (error) {
    console.error("getAllStandardSubjects error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
exports.getAllStandardSubjectsForAdmin = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("req.user", req.user);
    const query = {
      createdBy: userId,
    };

    const standardSubjects = await StandardSubject.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: standardSubjects.length,
      data: standardSubjects,
    });
  } catch (error) {
    console.error("getAllStandardSubjects error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
exports.getAllStandardSubjects = async (req, res) => {
  try {
    const userId = req.user._id;

    const query = {
      createdBy: userId,
    };

    const standardSubjects = await StandardSubject.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: standardSubjects.length,
      data: standardSubjects,
    });
  } catch (error) {
    console.error("getAllStandardSubjects error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
exports.getAllStandardSubjectsTeacher = async (req, res) => {
  try {
    const query = req.user.id;

    // 🔹 Build query dynamically

    const standardSubjects = await StandardSubject.find({ createdBy: query })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: standardSubjects.length,
      data: standardSubjects,
    });
  } catch (error) {
    console.error("getAllStandardSubjects error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// @desc    Get single standard subject by standard
// @route   GET /api/standard-subjects/:standard
// @access  Public/Private
exports.getStandardSubjectByStandard = async (req, res) => {
  try {
    const { standard } = req.params; // actually this is ID
    console.log("standard", standard);
    const standardSubject = await StandardSubject.findById(standard).populate(
      "createdBy",
      "name email",
    );

    if (!standardSubject) {
      return res.status(404).json({
        success: false,
        message: "Standard subject not found",
      });
    }

    res.status(200).json({
      success: true,
      data: standardSubject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create new standard subject
// @route   POST /api/standard-subjects
// @access  Private (Admin)

exports.createStandardSubject = async (req, res) => {
  try {
    const { standard, subject, part, medium, standardId } = req.body;
    const teacherId = req.user._id;
    console.log("teacherId", teacherId);
    const teacherProfile = await TeacherProfile.findOne({
      user: teacherId,
    }).lean();

    if (!teacherProfile) {
      return res.status(403).json({
        success: false,
        message: "Teacher profile not found. Please complete your profile.",
      });
    }

    const dbStandard = parseInt(standard, 10);
    const dbSubject = subject.trim().toLowerCase();
    const canTeachThisClass = teacherProfile.assignedClasses?.some((cls) => {
      const clsStandard = parseInt(cls.standard, 10);
      const clsSubject = cls.subject?.trim().toLowerCase();
      return clsStandard === dbStandard && clsSubject === dbSubject;
    });

    if (!canTeachThisClass) {
      return res.status(403).json({
        success: false,
        message: `You are not authorized to teach ${subject} for Standard ${standard}.`,
      });
    }

    // 🔴 BASIC VALIDATION
    if (!standard) {
      return res.status(400).json({
        success: false,
        message: "Standard is required",
      });
    }
    if (!subject) {
      return res.status(400).json({
        success: false,
        message: "Subject is required",
      });
    }
    if (!medium) {
      return res.status(400).json({
        success: false,
        message: "Medium is required",
      });
    }

    // 🔴 MEDIUM VALIDATION
    const allowedMediums = ["english", "malayalam"];
    if (!allowedMediums.includes(medium.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Medium must be either english or malayalam",
      });
    }

    // 🔴 DUPLICATE CHECK (PART AWARE)
    const existingStandard = await StandardSubject.findOne({
      standard: Number(standard),
      subject: subject.trim(),
      part: part ? part.trim() : null,
      medium: medium.toLowerCase(),
    });

    if (existingStandard) {
      return res.status(400).json({
        success: false,
        message: `Subject already exists for this standard`,
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
          pdfUrl: type === "pdf" ? uploaded.url : null,
        });
      }

      fs.unlink(file.path, () => {});
    }

    // Also handle media from body (if no file uploaded)
    if (req.body.media && !media.length) {
      media.push({
        url: req.body.media,
        type: "image",
      });
    }

    // 🔹 CREATE WITHOUT PRICING DATA
    const standardSubject = await StandardSubject.create({
      standardId: standardId,
      standard: Number(standard),
      subject: subject.trim(),
      part: part ? part.trim() : null,
      medium: medium.toLowerCase(),
      media,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Standard subject created successfully",
      data: standardSubject,
    });
  } catch (error) {
    console.error("Create StandardSubject error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update standard subject
// @route   PUT /api/standard-subjects/:id
// @access  Private (Admin)
exports.updateStandardSubject = async (req, res) => {
  try {
    const { id } = req.body;
    console.log("🔍 ALL req.body keys:", Object.keys(req.body));
    console.log("🔍 Full req.body content:", JSON.stringify(req.body, null, 2));

    const standardSubject = await StandardSubject.findById(id);
    if (!standardSubject) {
      return res.status(404).json({
        success: false,
        message: "Standard subject not found",
      });
    }

    const updateData = {};

    // 🔹 Basic fields
    //❌ User standard അയച്ചില്ല → update ചെയ്യരുത്
    //User standard അയച്ചു → update ചെയ്യാം
    if (req.body.standard !== undefined)
      updateData.standard = Number(req.body.standard);

    if (req.body.subject !== undefined) updateData.subject = req.body.subject;

    if (req.body.part !== undefined) updateData.part = req.body.part;

    if (req.body.medium !== undefined) updateData.medium = req.body.medium;

    // 🔹 Pricing fields (direct fields - not nested)
    // Access as req.body.pricing.monthlyPrice instead of req.body["pricing[monthlyPrice]"]
    if (req.body.pricing?.monthlyPrice !== undefined)
      updateData.monthlyPrice = Number(req.body.pricing.monthlyPrice);

    if (req.body.pricing?.yearlyPrice !== undefined)
      updateData.yearlyPrice = Number(req.body.pricing.yearlyPrice);

    if (req.body.pricing?.gstPercentage !== undefined)
      updateData.gstPercentage = Number(req.body.pricing.gstPercentage);

    // 🔹 Discount handling
    // Check if discount exists in the parsed pricing object
    if (req.body.pricing?.discount !== undefined) {
      const discount = req.body.pricing.discount;

      if (discount.type !== undefined || discount.value !== undefined) {
        updateData.discount = {};

        // Handle discount type
        if (discount.type !== undefined) {
          if (discount.type === "" || discount.type === null) {
            // Clear discount
            updateData.discount.type = undefined;
            updateData.discount.value = undefined;
          } else {
            updateData.discount.type = discount.type;
          }
        }

        // Handle discount value
        if (discount.value !== undefined) {
          updateData.discount.value = Number(discount.value);
        }
      }
    }

    // 🔹 Media
    const mediaFiles = req.files?.media || [];
    const newMediaUploads = [];

    for (const file of mediaFiles) {
      const uploaded = await uploadFileToCloudinary(file);

      if (uploaded?.url) {
        newMediaUploads.push({
          url: uploaded.url,
          type: uploaded.type || "image",
          pdfUrl: null,
        });
      }

      fs.unlink(file.path, () => {});
    }

    // decide update
    if (newMediaUploads.length > 0) {
      // delete old media
      if (req.body.media?.length > 0) {
        for (const old of req.body.media) {
          const publicId = old.url.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        }
      }

      updateData.media = newMediaUploads;
    } else {
      // keep old media safely
      updateData.media = standard.media;
    }

    // Debug: Log the update data
    console.log("🔍 Update Data:", JSON.stringify(updateData, null, 2));

    // 🔹 Unique check
    const duplicate = await StandardSubject.findOne({
      standard: updateData.standard ?? standardSubject.standard,
      subject: updateData.subject ?? standardSubject.subject,
      part: updateData.part ?? standardSubject.part,
      medium: updateData.medium ?? standardSubject.medium,
      _id: { $ne: id },
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "Same standard, subject, part and medium already exists",
      });
    }

    // 🔥 FINAL UPDATE
    const updated = await StandardSubject.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      },
    ).populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      message: "Standard subject updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Add media to standard subject
// @route   POST /api/standard-subjects/:id/media
// @access  Private (Admin)
exports.addMediaToStandardSubject = async (req, res) => {
  try {
    const standardSubject = await StandardSubject.findById(req.params.id);

    if (!standardSubject) {
      return res.status(404).json({
        success: false,
        message: "Standard subject not found",
      });
    }

    // Assuming media data comes in the request body
    const { url, type, pdfUrl } = req.body;

    if (!url || !type) {
      return res.status(400).json({
        success: false,
        message: "URL and type are required for media",
      });
    }

    // Validate media type
    const validTypes = ["image", "video", "pdf"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Type must be one of: ${validTypes.join(", ")}`,
      });
    }

    standardSubject.media.push({ url, type, pdfUrl });
    await standardSubject.save();

    res.status(200).json({
      success: true,
      message: "Media added successfully",
      data: standardSubject.media,
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

// @desc    Remove media from standard subject
// @route   DELETE /api/standard-subjects/:id/media/:mediaId
// @access  Private (Admin)
exports.removeMediaFromStandardSubject = async (req, res) => {
  try {
    const standardSubject = await StandardSubject.findById(req.params.id);

    if (!standardSubject) {
      return res.status(404).json({
        success: false,
        message: "Standard subject not found",
      });
    }

    // Find media index
    const mediaIndex = standardSubject.media.findIndex(
      (media) => media._id.toString() === req.params.mediaId,
    );

    if (mediaIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    // Remove media
    standardSubject.media.splice(mediaIndex, 1);
    await standardSubject.save();

    res.status(200).json({
      success: true,
      message: "Media removed successfully",
      data: standardSubject.media,
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

// @desc    Delete standard subject
// @route   DELETE /api/standard-subjects/:id
// @access  Private (Admin)
exports.deleteStandardSubject = async (req, res) => {
  try {
    const standardSubject = await StandardSubject.findById(req.params.id);

    if (!standardSubject) {
      return res.status(404).json({
        success: false,
        message: "Standard subject not found",
      });
    }

    await standardSubject.deleteOne();

    res.status(200).json({
      success: true,
      message: "Standard subject deleted successfully",
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

// @desc    Get subjects by standard range
// @route   GET /api/standard-subjects/range/:min/:max
// @access  Public
exports.getStandardSubjectsByRange = async (req, res) => {
  try {
    const min = parseInt(req.params.min);
    const max = parseInt(req.params.max);

    if (isNaN(min) || isNaN(max) || min < 1 || max > 12 || min > max) {
      return res.status(400).json({
        success: false,
        message: "Invalid range parameters. Min and max must be between 1-12",
      });
    }

    const standardSubjects = await StandardSubject.find({
      standard: { $gte: min, $lte: max },
    })
      .populate("createdBy", "name email")
      .sort({ standard: 1 });

    res.status(200).json({
      success: true,
      count: standardSubjects.length,
      data: standardSubjects,
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
