const Standard = require("../models/standardSchema");
const User = require("../models/loginUserModel");
const { uploadFileToCloudinary } = require("../config/cloudinary");
const TeacherProfile = require("../models/teacherProfile");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
exports.createStandard = async (req, res) => {
  try {
    const { standard, medium } = req.body;
    const adminId = req.user._id;

    const isAuthorizedPerson = await User.findOne({
      _id: adminId,
      role: "admin",
    }).lean();

    if (!isAuthorizedPerson) {
      return res.status(403).json({
        success: false,
        message: "Admin not authorized",
      });
    }

    const dbStandard = parseInt(standard, 10);

    // 🔴 BASIC VALIDATION
    if (!standard) {
      return res.status(400).json({
        success: false,
        message: "Standard is required",
      });
    }

    if (!medium) {
      return res.status(400).json({
        success: false,
        message: "medium is required",
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

    // 🔴 PRICING VALIDATION
    if (!req.body.pricing?.monthlyPrice) {
      return res.status(400).json({
        success: false,
        message: "Monthly price is required",
      });
    }

    // Parse pricing values
    const monthlyPrice = Number(req.body.pricing?.monthlyPrice);
    const yearlyPrice = Number(
      req.body.pricing?.yearlyPrice || monthlyPrice * 12,
    );
    const gstPercentage = Number(req.body.pricing?.gstPercentage || 18);

    // Validate pricing values
    if (monthlyPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Monthly price must be greater than 0",
      });
    }

    if (yearlyPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Yearly price must be greater than 0",
      });
    }

    // Handle discount
    // ---------------- HANDLE DISCOUNT ----------------
    let discount = undefined;

    if (req.body.pricing?.discount?.type) {
      const discountType = req.body.pricing.discount.type;
      const discountValue = Number(req.body.pricing.discount.value || 0);

      // ✅ Read appliesTo (default yearly)
      const appliesTo = req.body.pricing.discount.appliesTo || "yearly";

      // ✅ Validate appliesTo
      if (!["yearly", "monthly"].includes(appliesTo)) {
        return res.status(400).json({
          success: false,
          message: "Invalid discount appliesTo value",
        });
      }

      // ✅ Validate discount value
      if (discountType === "percentage") {
        if (discountValue < 0 || discountValue > 100) {
          return res.status(400).json({
            success: false,
            message: "Percentage discount must be between 0 and 100",
          });
        }
      } else if (discountType === "flat") {
        if (discountValue < 0) {
          return res.status(400).json({
            success: false,
            message: "Flat discount must be greater than or equal to 0",
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid discount type",
        });
      }

      // ✅ Build discount object
      discount = {
        type: discountType,
        value: discountValue,
        appliesTo, // 👈 IMPORTANT
      };
    }

    // 🔴 DUPLICATE CHECK (PART AWARE)
    const existingStandard = await Standard.findOne({
      standard: Number(standard),

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

    // 🔹 CREATE WITH PRICING DATA
    const standardSubject = await Standard.create({
      standard: Number(standard),

      medium: medium.toLowerCase(),
      monthlyPrice: monthlyPrice,
      yearlyPrice: yearlyPrice,
      gstPercentage: gstPercentage,
      discount: discount,
      media,
      pricing: {
        monthly: Number(monthlyPrice),
        yearly: Number(yearlyPrice),
      },
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Standard subject created successfully",
      data: standardSubject,
    });
  } catch (error) {
    console.error("Create Standard error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
exports.getAllStandards = async (req, res) => {
  try {
    const userId = req.user._id;

    const standards = await Standard.find({
      createdBy: userId, // ✅ only logged-in user's standards
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: standards.length,
      data: standards,
    });
  } catch (error) {
    console.error("getAllStandards error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
exports.getAllStandardsForStudents = async (req, res) => {
  try {
    const standards = await Standard.find({})
      .select("_id standard medium") // 👈 Only required fields
      .lean(); // 👈 Faster response (no mongoose doc)

    res.status(200).json({
      success: true,
      count: standards.length,
      data: standards,
    });
  } catch (error) {
    console.error("getAllStandards error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
exports.getThisStandardById = async (req, res) => {
  try {
    const { standard } = req.params; // actually this is ID

    const standardSubject = await Standard.findById(standard).populate(
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
exports.updateStandard = async (req, res) => {
  try {
    const { id } = req.body;

    const standard = await Standard.findById(id);
    if (!standard) {
      return res.status(404).json({
        success: false,
        message: "Standard not found",
      });
    }

    const updateData = {};

    // 🔹 Basic fields
    if (req.body.standard !== undefined)
      updateData.standard = Number(req.body.standard);

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
    console.log("FILES:", req.files);
    console.log("BODY:", req.body.media);

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
      if (standard.media?.length > 0) {
        for (const old of standard.media) {
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

    // 🔹 Unique check
    const duplicate = await Standard.findOne({
      standard: updateData.standard ?? standardSubject.standard,

      medium: updateData.medium ?? standardSubject.medium,
      _id: { $ne: id },
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "Same standard and medium already exists",
      });
    }

    // 🔥 FINAL UPDATE
    const updated = await Standard.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      },
    ).populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      message: "Standard updated successfully",
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

exports.getAllStandardsForTeacher = async (req, res) => {
  try {
    const teacher = await TeacherProfile.findOne({
      user: req.user._id,
      applicationStatus: "approved",
    }).select("assignedClasses");

    if (!teacher || !teacher.assignedClasses?.length) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Still not created your standard based subject",
      });
    }

    const allowed = teacher.assignedClasses.map((cls) => ({
      standard: cls.standard,
      medium: cls.medium,
    }));
    console.log("allowed", allowed);
    const standards = await Standard.find({
      $or: allowed,
    }).select("_id standard medium");

    if (!standards.length) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Still not created your standard based subject",
      });
    }

    const result = standards.map((std) => {
      const subjects = teacher.assignedClasses
        .filter(
          (cls) => cls.standard === std.standard && cls.medium === std.medium,
        )
        .map((cls) => cls.subject);

      return {
        _id: std._id,
        standard: std.standard,
        medium: std.medium,
        subjects,
      };
    });

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("getAllStandardsForTeacher error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
exports.deleteStandard = async (req, res) => {
  try {
    const standard = await Standard.findById(req.params.id);

    if (!standard) {
      return res.status(404).json({
        success: false,
        message: "Standard  not found",
      });
    }

    await standard.deleteOne();

    res.status(200).json({
      success: true,
      message: "Standard  deleted successfully",
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
