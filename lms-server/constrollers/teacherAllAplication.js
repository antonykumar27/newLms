const mongoose = require("mongoose");
const User = require("../models/loginUserModel.js");
const Notification = require("../models/notificationSchema .js");
const TeacherProfile = require("../models/teacherProfile.js");
const AuditLog = require("../models/auditLogModel.js");
const {
  createNotification,
} = require("../constrollers/notificationService.js");
const {
  sendTeacherApprovalEmail,
  sendTeacherRejectionEmail,
} = require("../constrollers/teacherEmail.js");
const { io, getReceiverSocketId } = require("../server.js");
// Approve teacher application
const approveApplication = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // ========================
    // 1. ADMIN VALIDATION
    // ========================
    const adminRoles = req.user?.role ? [req.user.role] : [];

    const isAdmin =
      req.user?.isAdmin === true ||
      adminRoles.includes("admin") ||
      adminRoles.includes("super_admin");

    if (!isAdmin) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "Admin permission required",
        code: "ADMIN_PERMISSION_REQUIRED",
      });
    }

    // ========================
    // 2. FIND TEACHER PROFILE
    // ========================

    const teacherProfile = await TeacherProfile.findById(id).session(session);

    if (!teacherProfile) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
        code: "TEACHER_PROFILE_NOT_FOUND",
      });
    }

    // ========================
    // 3. FIND THE USER
    // ========================

    const teacher = await User.findById(teacherProfile.user).session(session);

    if (!teacher) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // ========================
    // 4. STATUS VALIDATION
    // ========================
    const currentStatus = teacherProfile.application.status;

    if (currentStatus === "approved") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Application already approved",
        code: "ALREADY_APPROVED",
      });
    }

    if (currentStatus === "rejected") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Cannot approve rejected application",
        code: "APPLICATION_REJECTED",
      });
    }

    if (currentStatus !== "pending") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Invalid status: ${currentStatus}`,
        code: "INVALID_STATUS",
      });
    }

    // ========================
    // 5. UPDATE TEACHER PROFILE
    // ========================

    const approvalDate = new Date();
    teacherProfile.applicationStatus = "approved";
    teacherProfile.application.status = "approved";
    teacherProfile.application.approvedAt = approvalDate;
    teacherProfile.application.reviewedBy = req.user._id;

    teacherProfile.verification.isVerified = true;
    teacherProfile.verification.verifiedAt = approvalDate;
    teacherProfile.verification.verifiedBy = req.user._id;

    teacherProfile.metadata.lastActivity = approvalDate;
    teacherProfile.metadata.profileCompletion = Math.max(
      teacherProfile.metadata.profileCompletion || 0,
      60,
    );

    await teacherProfile.save({ session });

    // ========================
    // 6. UPDATE USER ROLE - THIS IS THE KEY PART
    // ========================

    // ✅ THIS IS THE FIX - Update user role from null to "teacher"
    teacher.role = "teacher";
    teacher.isTeacher = true;

    // Save the user
    await teacher.save({ session });

    // ========================
    // 7. VERIFY THE UPDATE
    // ========================

    const updatedUser = await User.findById(teacher._id).session(session);

    // ========================
    // 8. CREATE NOTIFICATION
    // ========================
    const notification = new Notification({
      userId: teacher._id,
      type: "teacher_application_approved",
      title: "Teacher Application Approved",
      message: "Your teacher application has been approved.",
      data: {
        approvalDate,
        nextSteps: ["Complete profile", "Create first course"],
        note: "You may need to log out and log back in for all features to work properly",
      },
      priority: "high",
      isRead: false,
    });

    await notification.save({ session });

    // ========================
    // 9. SOCKET.IO NOTIFICATION
    // ========================
    // if (teacherSocketId) {
    //   // ഒരേ event-ൽ എല്ലാം
    //   io.to(teacherSocketId).emit("APPROVAL_SUCCESS", {
    //     // Notification details
    //     notification: {
    //       title: "Teacher Application Approved",
    //       message: "Your teacher application has been approved",
    //       type: "success",
    //     },
    //     // Role update details
    //     roleUpdate: {
    //       oldRole: null, // or teacher.oldRole
    //       newRole: "teacher",
    //       updatedAt: new Date(),
    //     },
    //     // Refresh instructions
    //     refresh: {
    //       required: true,
    //       endpoint: "/api/auth/refresh-token",
    //       auto: true, // Frontend auto refresh ചെയ്യാം
    //     },
    //     // Metadata
    //     metadata: {
    //       userId: teacher._id,
    //       approvalId: teacherProfile._id,
    //       approvedBy: req.user._id,
    //     },
    //   });
    // }

    // ========================
    // 10. COMMIT TRANSACTION
    // ========================
    await session.commitTransaction();
    session.endSession();
    console.log("✅ Transaction committed successfully");

    // ========================
    // 11. RESPONSE
    // ========================
    res.status(200).json({
      success: true,
      message: "Teacher application approved successfully",
      data: {
        teacherProfileId: teacherProfile._id,
        userId: teacher._id,
        userName: teacher.name,
        userEmail: teacher.email,
        oldRole: null, // Was null
        newRole: teacher.role, // Should be "teacher"
        isTeacher: teacher.isTeacher, // Should be true
        status: "approved",
        approvalDate,
      },
    });

    console.log("🎉 Approval process completed successfully");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("❌ Approve application error:", error);
    console.error("Error stack:", error.stack);

    const statusCode = error.name === "ValidationError" ? 400 : 500;
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Failed to approve application"
        : error.message;

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      code: "APPROVAL_FAILED",
      detailedError:
        process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
};
// Reject teacher application
const rejectApplication = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const {
      rejectionReason,
      feedback,
      allowReapply = true,
      reapplyAfterDays = 30,
      adminNotes,
    } = req.body;

    const adminId = req.user._id;
    const adminName = req.user.name;

    // ========================
    // 1. VALIDATION
    // ========================
    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
        code: "INVALID_USER_ID",
      });
    }

    // Check admin permission
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "Only admins can reject teacher applications",
        code: "ADMIN_PERMISSION_REQUIRED",
      });
    }

    // Validate rejection reason
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message:
          "Please provide a detailed rejection reason (minimum 10 characters)",
        code: "INVALID_REJECTION_REASON",
      });
    }

    // Get user
    const user = await User.findById(id).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    if (!user.teacherProfile?.isApplied) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "No teacher application found for this user",
        code: "NO_TEACHER_APPLICATION",
      });
    }

    // ========================
    // 2. STATUS VALIDATION
    // ========================
    const currentStatus = user.teacherProfile.applicationStatus;

    if (currentStatus === "rejected") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Application already rejected",
        code: "ALREADY_REJECTED",
        data: {
          rejectionDate: user.teacherProfile.rejectionDate,
          rejectionReason: user.teacherProfile.rejectionReason,
        },
      });
    }

    if (currentStatus === "approved") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message:
          "Cannot reject an approved application. Please deactivate instead.",
        code: "APPLICATION_APPROVED",
      });
    }

    // ========================
    // 3. UPDATE USER RECORD
    // ========================
    const rejectionDate = new Date();

    // Update teacher profile
    user.teacherProfile.applicationStatus = "rejected";
    user.teacherProfile.rejectionDate = rejectionDate;
    user.teacherProfile.rejectionReason = rejectionReason;
    user.teacherProfile.feedback = feedback;
    user.teacherProfile.adminNotes = adminNotes;
    user.teacherProfile.rejectedBy = {
      adminId: adminId,
      adminName: adminName,
      adminEmail: req.user.email,
    };

    // Set reapplication date if allowed
    if (allowReapply) {
      const reapplyDate = new Date();
      reapplyDate.setDate(reapplyDate.getDate() + reapplyAfterDays);
      user.teacherProfile.canReapplyAfter = reapplyDate;
    } else {
      user.teacherProfile.canReapplyAfter = null;
      user.teacherProfile.isBannedFromApplying = true;
    }

    // Remove teacher role if exists
    const teacherIndex = user.roles.indexOf("teacher");
    if (teacherIndex > -1) {
      user.roles.splice(teacherIndex, 1);
    }

    await user.save({ session });

    // ========================
    // 4. CREATE NOTIFICATION
    // ========================
    const notification = new Notification({
      userId: user._id,
      type: "teacher_rejection",
      title: "Teacher Application Update",
      message: `Your teacher application has been reviewed.`,
      data: {
        status: "rejected",
        rejectionDate,
        rejectionReason,
        feedback,
        canReapply: allowReapply,
        reapplyAfter: allowReapply ? reapplyAfterDays : null,
        reapplyDate: allowReapply
          ? new Date(Date.now() + reapplyAfterDays * 24 * 60 * 60 * 1000)
          : null,
        suggestions:
          feedback || "Please review our teacher requirements and apply again.",
        supportContact: process.env.SUPPORT_EMAIL,
      },
      priority: "high",
      isRead: false,
    });

    await notification.save({ session });

    // ========================
    // 5. AUDIT LOG
    // ========================
    const auditLog = new AuditLog({
      action: "teacher_rejection",
      performedBy: {
        userId: adminId,
        name: adminName,
        role: req.user.role,
      },
      targetUser: {
        userId: user._id,
        name: user.name,
        email: user.email,
      },
      changes: {
        before: {
          roles: [...user.roles, "teacher"].filter((r) => r),
          teacherStatus: "pending",
        },
        after: {
          roles: user.roles.filter((r) => r !== "teacher"),
          teacherStatus: "rejected",
          rejectionReason,
        },
      },
      metadata: {
        rejectionReason,
        allowReapply,
        reapplyAfterDays,
        adminNotes,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
      timestamp: rejectionDate,
    });

    await auditLog.save({ session });

    // ========================
    // 6. SEND REJECTION EMAIL
    // ========================
    const emailData = {
      userName: user.name,
      rejectionDate: rejectionDate.toLocaleDateString(),
      rejectionReason,
      feedback: feedback || "No specific feedback provided.",
      canReapply: allowReapply,
      reapplyAfterDays: allowReapply ? reapplyAfterDays : null,
      supportEmail: process.env.SUPPORT_EMAIL,
      applicationId: user._id.toString(),
      improvementTips: [
        "Complete all required documents",
        "Provide more detailed experience information",
        "Improve your course proposal",
      ],
    };

    sendTeacherRejectionEmail(user.email, emailData)
      .then(() => console.log(`Rejection email sent to ${user.email}`))
      .catch((err) => console.error("Failed to send rejection email:", err));

    // ========================
    // 7. COMMIT TRANSACTION
    // ========================
    await session.commitTransaction();
    session.endSession();

    // ========================
    // 8. RESPONSE
    // ========================
    res.status(200).json({
      success: true,
      message: "Teacher application rejected successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        rejection: {
          reason: rejectionReason,
          date: rejectionDate,
          canReapply: allowReapply,
          reapplyAfterDays: allowReapply ? reapplyAfterDays : null,
        },
        metadata: {
          rejectedBy: adminName,
          rejectedAt: rejectionDate,
          transactionId: session.id,
        },
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Reject teacher application error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to reject teacher application",
      code: "REJECTION_FAILED",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await TeacherProfile.findById(id)

      .populate(
        "user",
        "name email phone parishImage createdAt role teacherProfile",
      )
      .lean();
    console.log("user786", user);
    if (!user || !user?.isApplied) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get application details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch application details",
    });
  }
};

// Get all pending applications

// Get all teacher applications (Keep your existing format)
const getPendingApplications = async (req, res) => {
  try {
    const {
      status = "all",
      search = "",
      page = 1,
      limit = 10,
      sortBy = "applicationDate",
      sortOrder = "desc",
    } = req.query;

    // Build query
    let query = {
      applicationStatus: "pending",
      isApplied: true,
    };

    // Filter by status
    // if (status !== "all") {
    //   query["teacherProfile.applicationStatus"] = status;
    // }

    // Search by name, email, or bio
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        // { "teacherProfile.bio": { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort
    const sort = {};
    if (sortBy === "name") {
      sort.name = sortOrder === "desc" ? -1 : 1;
    } else if (sortBy === "applicationDate") {
      sort["teacherProfile.applicationDate"] = sortOrder === "desc" ? -1 : 1;
    } else if (sortBy === "hourlyRate") {
      sort["teacherProfile.hourlyRate"] = sortOrder === "desc" ? -1 : 1;
    }

    // Get applications with pagination
    const applications = await TeacherProfile.find(query)
      .populate("user", "name email phone parishImage createdAt")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); //👉 TeacherProfile-ൽ ഉള്ള user field
    //(ObjectId) ഉപയോഗിച്ച് User collection-ൽ നിന്ന് data join ചെയ്യുന്നു.
    console.log("applications", applications);
    // Get total count for pagination
    const total = await TeacherProfile.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Get statistics
    const stats = {
      total: await TeacherProfile.countDocuments({
        isApplied: true,
      }),
      pending: await TeacherProfile.countDocuments({
        applicationStatus: "pending",
      }),
      approved: await TeacherProfile.countDocuments({
        applicationStatus: "approved",
      }),
      rejected: await TeacherProfile.countDocuments({
        applicationStatus: "rejected",
      }),
    };

    res.status(200).json({
      success: true,
      data: {
        applications, // Your original applications data
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        },
        stats,
      },
    });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
    });
  }
};
// Update teacher application (by user)
const updateApplication = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const {
      // Personal info
      bio,
      hourlyRate,

      // Expertise
      expertise,

      // Qualifications
      qualifications,

      // Experience
      experience,

      // Social links
      socialLinks,

      // Documents (URLs only - actual files should be uploaded separately)
      mediaUrls,
      resumeUrls,
      idProofUrls,

      // Metadata
      metadata,
      settings,
    } = req.body;

    // ========================
    // 1. VALIDATE USER
    // ========================
    const user = await User.findById(userId).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Check if user has a teacher application
    if (!user.teacherProfile?.isApplied) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "You don't have a teacher application. Please apply first.",
        code: "NO_APPLICATION_FOUND",
        action: "apply",
      });
    }

    // Check application status
    const currentStatus = user.teacherProfile.applicationStatus;

    if (currentStatus === "approved") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message:
          "Your application is already approved. Please update your teacher profile instead.",
        code: "APPLICATION_ALREADY_APPROVED",
        redirect: "/teacher/profile",
      });
    }

    if (currentStatus === "rejected") {
      // Check if user can reapply
      const canReapply =
        !user.teacherProfile.isBannedFromApplying &&
        (!user.teacherProfile.canReapplyAfter ||
          new Date() >= new Date(user.teacherProfile.canReapplyAfter));

      if (!canReapply) {
        const nextDate = user.teacherProfile.canReapplyAfter
          ? new Date(user.teacherProfile.canReapplyAfter).toLocaleDateString()
          : "Never";

        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Your application was rejected. You can reapply after ${nextDate}`,
          code: "CANNOT_REAPPLY_YET",
          nextReapplyDate: user.teacherProfile.canReapplyAfter,
        });
      }
    }

    // ========================
    // 2. VALIDATE UPDATE DATA
    // ========================
    const updateData = {};
    const changes = [];

    // Bio validation
    if (bio !== undefined) {
      if (typeof bio !== "string" || bio.trim().length < 50) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Bio must be at least 50 characters",
          code: "INVALID_BIO",
        });
      }
      updateData["teacherProfile.bio"] = bio.trim();
      changes.push("bio");
    }

    // Hourly rate validation
    if (hourlyRate !== undefined) {
      const rate = Number(hourlyRate);
      if (isNaN(rate) || rate < 0 || rate > 1000) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Hourly rate must be between $0 and $1000",
          code: "INVALID_HOURLY_RATE",
        });
      }
      updateData["teacherProfile.hourlyRate"] = rate;
      changes.push("hourly_rate");
    }

    // Expertise validation
    if (expertise !== undefined) {
      let expertiseArray;
      try {
        expertiseArray = Array.isArray(expertise)
          ? expertise
          : JSON.parse(expertise);
      } catch {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Expertise must be a valid array",
          code: "INVALID_EXPERTISE",
        });
      }

      if (!Array.isArray(expertiseArray) || expertiseArray.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Please add at least one area of expertise",
          code: "EXPERTISE_REQUIRED",
        });
      }

      if (expertiseArray.length > 10) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Maximum 10 areas of expertise allowed",
          code: "TOO_MANY_EXPERTISE",
        });
      }

      updateData["teacherProfile.expertise"] = expertiseArray
        .map((e) => e.trim())
        .filter((e) => e.length > 0);
      changes.push("expertise");
    }

    // Qualifications validation
    if (qualifications !== undefined) {
      let qualificationsArray;
      try {
        qualificationsArray = Array.isArray(qualifications)
          ? qualifications
          : JSON.parse(qualifications);
      } catch {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Qualifications must be a valid array",
          code: "INVALID_QUALIFICATIONS",
        });
      }

      if (!Array.isArray(qualificationsArray)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Qualifications must be an array",
          code: "QUALIFICATIONS_ARRAY_REQUIRED",
        });
      }

      // Validate each qualification
      const validatedQualifications = [];
      for (const [index, qual] of qualificationsArray.entries()) {
        if (!qual.degree || !qual.institution) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            success: false,
            message: `Qualification ${
              index + 1
            } must have degree and institution`,
            code: "INVALID_QUALIFICATION",
          });
        }

        validatedQualifications.push({
          degree: qual.degree.trim(),
          institution: qual.institution.trim(),
          year: qual.year ? Number(qual.year) : null,
          certificateUrl: qual.certificateUrl || "",
          verified: false, // Reset verification status
        });
      }

      updateData["teacherProfile.qualifications"] = validatedQualifications;
      changes.push("qualifications");
    }

    // Experience validation
    if (experience !== undefined) {
      let experienceArray;
      try {
        experienceArray = Array.isArray(experience)
          ? experience
          : JSON.parse(experience);
      } catch {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Experience must be a valid array",
          code: "INVALID_EXPERIENCE",
        });
      }

      if (!Array.isArray(experienceArray)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Experience must be an array",
          code: "EXPERIENCE_ARRAY_REQUIRED",
        });
      }

      // Validate each experience
      const validatedExperience = [];
      for (const [index, exp] of experienceArray.entries()) {
        if (!exp.position || !exp.organization) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            success: false,
            message: `Experience ${
              index + 1
            } must have position and organization`,
            code: "INVALID_EXPERIENCE_ITEM",
          });
        }

        // Date validation
        let startDate = null;
        let endDate = null;

        if (exp.startDate) {
          startDate = new Date(exp.startDate);
          if (isNaN(startDate.getTime())) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
              success: false,
              message: `Invalid start date in experience ${index + 1}`,
              code: "INVALID_START_DATE",
            });
          }
        }

        if (exp.endDate && !exp.currentlyWorking) {
          endDate = new Date(exp.endDate);
          if (isNaN(endDate.getTime())) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
              success: false,
              message: `Invalid end date in experience ${index + 1}`,
              code: "INVALID_END_DATE",
            });
          }

          // Check if end date is after start date
          if (startDate && endDate <= startDate) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
              success: false,
              message: `End date must be after start date in experience ${
                index + 1
              }`,
              code: "INVALID_DATE_RANGE",
            });
          }
        }

        validatedExperience.push({
          position: exp.position.trim(),
          organization: exp.organization.trim(),
          description: exp.description?.trim() || "",
          startDate: startDate,
          endDate: endDate,
          currentlyWorking: exp.currentlyWorking || false,
          verificationUrl: exp.verificationUrl || "",
        });
      }

      updateData["teacherProfile.experience"] = validatedExperience;
      changes.push("experience");
    }

    // Social links validation
    if (socialLinks !== undefined) {
      let socialLinksObj;
      try {
        socialLinksObj =
          typeof socialLinks === "string"
            ? JSON.parse(socialLinks)
            : socialLinks;
      } catch {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Social links must be a valid object",
          code: "INVALID_SOCIAL_LINKS",
        });
      }

      const allowedSocialLinks = [
        "linkedin",
        "github",
        "twitter",
        "website",
        "youtube",
        "portfolio",
      ];
      const validatedSocialLinks = {};

      for (const [key, value] of Object.entries(socialLinksObj)) {
        if (
          allowedSocialLinks.includes(key) &&
          value &&
          typeof value === "string"
        ) {
          // Basic URL validation
          if (value.trim() && !isValidUrl(value)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
              success: false,
              message: `Invalid URL for ${key}`,
              code: "INVALID_SOCIAL_URL",
            });
          }
          validatedSocialLinks[key] = value.trim();
        }
      }

      updateData["teacherProfile.socialLinks"] = validatedSocialLinks;
      changes.push("social_links");
    }

    // Document URLs validation
    if (mediaUrls !== undefined) {
      const validatedMedia = await validateDocumentUrls(
        mediaUrls,
        ["image", "video", "pdf"],
        "media",
      );
      updateData["teacherProfile.media"] = validatedMedia;
      changes.push("media");
    }

    if (resumeUrls !== undefined) {
      const validatedResume = await validateDocumentUrls(
        resumeUrls,
        ["image", "video", "pdf"],
        "resume",
      );
      updateData["teacherProfile.resumeUrl"] = validatedResume;
      changes.push("resume");
    }

    if (idProofUrls !== undefined) {
      const validatedIdProof = await validateDocumentUrls(
        idProofUrls,
        [
          "image",
          "video",
          "pdf",
          "image/jpeg",
          "image/png",
          "video/mp4",
          "application/pdf",
        ],
        "id_proof",
      );
      updateData["teacherProfile.idProofUrl"] = validatedIdProof;
      changes.push("id_proof");
    }

    // Metadata
    if (metadata !== undefined) {
      const validatedMetadata = {
        ...user.teacherProfile.metadata,
        ...metadata,
        lastProfileUpdate: new Date(),
      };
      updateData["teacherProfile.metadata"] = validatedMetadata;
    }

    // Settings
    if (settings !== undefined) {
      updateData["teacherProfile.settings"] = {
        ...user.teacherProfile.settings,
        ...settings,
      };
    }

    // ========================
    // 3. CHECK IF RESUBMISSION
    // ========================
    const isResubmission = currentStatus === "rejected";

    if (isResubmission) {
      // Move current rejection to previous rejections
      const previousRejection = {
        date: user.teacherProfile.rejectionDate,
        reason: user.teacherProfile.rejectionReason,
        feedback: user.teacherProfile.feedback,
        rejectedBy: user.teacherProfile.rejectedBy,
      };

      updateData["teacherProfile.previousRejections"] = [
        ...(user.teacherProfile.previousRejections || []),
        previousRejection,
      ];

      // Reset rejection fields
      updateData["teacherProfile.applicationStatus"] = "pending";
      updateData["teacherProfile.rejectionDate"] = null;
      updateData["teacherProfile.rejectionReason"] = null;
      updateData["teacherProfile.feedback"] = null;
      updateData["teacherProfile.rejectedBy"] = null;
      updateData["teacherProfile.canReapplyAfter"] = null;
      updateData["teacherProfile.applicationDate"] = new Date();

      changes.push("status_reset");
    } else {
      // Regular update - update last modified date
      updateData["teacherProfile.metadata.lastProfileUpdate"] = new Date();
    }

    // ========================
    // 4. UPDATE APPLICATION COMPLETENESS
    // ========================
    const tempUser = { ...user.toObject() };

    // Apply updates to temp object for completeness calculation
    for (const [key, value] of Object.entries(updateData)) {
      const keys = key.split(".");
      let obj = tempUser;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
    }

    const completenessScore = calculateApplicationCompleteness(
      tempUser.teacherProfile,
    );
    updateData["teacherProfile.metadata.completenessScore"] = completenessScore;

    // ========================
    // 5. APPLY UPDATES
    // ========================
    const updateResult = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        session,
        new: true,
        runValidators: true,
      },
    ).select("name email teacherProfile");

    // ========================
    // 6. CREATE AUDIT LOG
    // ========================
    const auditLog = new AuditLog({
      action: isResubmission
        ? "teacher_application_resubmit"
        : "teacher_application_update",
      performedBy: {
        userId: userId,
        name: user.name,
        email: user.email,
      },
      targetUser: {
        userId: userId,
        name: user.name,
        email: user.email,
      },
      changes: changes,
      metadata: {
        completenessScore,
        isResubmission,
        previousStatus: currentStatus,
        newStatus: updateResult.teacherProfile.applicationStatus,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
      timestamp: new Date(),
    });

    await auditLog.save({ session });

    // ========================
    // 7. CREATE NOTIFICATION FOR ADMINS
    // ========================
    if (isResubmission || changes.length > 0) {
      // Get all admins
      const admins = await User.find({
        role: { $in: ["admin", "superadmin"] },
        status: "active",
      })
        .select("_id")
        .session(session);

      // Create notifications for each admin
      const adminNotifications = admins.map((admin) => ({
        userId: admin._id,
        type: isResubmission
          ? "teacher_application_resubmitted"
          : "teacher_application_updated",
        title: isResubmission
          ? "📝 Teacher Application Resubmitted"
          : "📝 Teacher Application Updated",
        message: isResubmission
          ? `${user.name} has resubmitted their teacher application`
          : `${user.name} has updated their teacher application`,
        data: {
          applicantId: userId,
          applicantName: user.name,
          completenessScore,
          changes,
          isResubmission,
          applicationDate: updateResult.teacherProfile.applicationDate,
          applicationLink: `/admin/teachers/applications/${userId}`,
        },
        priority: "medium",
        isRead: false,
      }));

      if (adminNotifications.length > 0) {
        await Notification.insertMany(adminNotifications, { session });
      }
    }

    // ========================
    // 8. SEND CONFIRMATION EMAIL
    // ========================
    const emailData = {
      userName: user.name,
      updateType: isResubmission ? "resubmission" : "update",
      changes: changes.map((c) => c.replace(/_/g, " ")),
      completenessScore,
      applicationDate: updateResult.teacherProfile.applicationDate,
      applicationId: userId.toString(),
      reviewTime: "3-5 business days",
      supportEmail: process.env.SUPPORT_EMAIL,
    };

    sendApplicationUpdateEmail(user.email, emailData)
      .then(() =>
        console.log(`Update confirmation email sent to ${user.email}`),
      )
      .catch((err) => console.error("Failed to send update email:", err));

    // ========================
    // 9. COMMIT TRANSACTION
    // ========================
    await session.commitTransaction();
    session.endSession();

    // ========================
    // 10. RESPONSE
    // ========================
    res.status(200).json({
      success: true,
      message: isResubmission
        ? "Application resubmitted successfully"
        : "Application updated successfully",
      data: {
        application: {
          id: userId,
          status: updateResult.teacherProfile.applicationStatus,
          completenessScore,
          applicationDate: updateResult.teacherProfile.applicationDate,
          lastUpdated: updateResult.teacherProfile.metadata?.lastProfileUpdate,
        },
        updates: {
          fieldsUpdated: changes,
          isResubmission,
          previousStatus: currentStatus,
        },
        nextSteps: {
          review: "Your application will be reviewed within 3-5 business days",
          notification: "You'll be notified via email when a decision is made",
          support: `Contact ${process.env.SUPPORT_EMAIL} for questions`,
        },
        metadata: {
          updatedAt: new Date(),
          transactionId: session.id,
        },
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Update application error:", error);

    let statusCode = 500;
    let errorCode = "UPDATE_FAILED";

    if (error.name === "ValidationError") {
      statusCode = 400;
      errorCode = "VALIDATION_ERROR";
    } else if (error.name === "MongoError" && error.code === 11000) {
      statusCode = 400;
      errorCode = "DUPLICATE_ERROR";
    }

    res.status(statusCode).json({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Failed to update application"
          : error.message,
      code: errorCode,
      details:
        process.env.NODE_ENV === "development"
          ? {
              error: error.message,
              stack: error.stack,
            }
          : undefined,
    });
  }
};

// Admin updates teacher application (for admin panel)
const adminUpdateApplication = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const adminId = req.user._id;
    const adminName = req.user.name;

    const {
      // Admin-only fields
      applicationStatus,
      commissionRate,
      permissions,
      accessLevel,
      adminNotes,
      feedback,

      // Regular fields that admins can also update
      bio,
      expertise,
      qualifications,
      experience,
      hourlyRate,
      socialLinks,
      isVerified,
      metadata,
      settings,
    } = req.body;

    // ========================
    // 1. VALIDATION
    // ========================
    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
        code: "INVALID_USER_ID",
      });
    }

    // Check admin permission
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "Admin access required",
        code: "ADMIN_PERMISSION_REQUIRED",
      });
    }

    // Get user
    const user = await User.findById(id).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    if (!user.teacherProfile?.isApplied) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "No teacher application found",
        code: "NO_APPLICATION_FOUND",
      });
    }

    // ========================
    // 2. PREPARE UPDATES
    // ========================
    const updateData = {};
    const changes = [];
    const oldValues = {};

    // Admin-only fields
    if (applicationStatus !== undefined) {
      const validStatuses = [
        "pending",
        "approved",
        "rejected",
        "suspended",
        "inactive",
      ];
      if (!validStatuses.includes(applicationStatus)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(
            ", ",
          )}`,
          code: "INVALID_STATUS",
        });
      }

      // Status transition validation
      const currentStatus = user.teacherProfile.applicationStatus;
      oldValues.applicationStatus = currentStatus;

      if (applicationStatus !== currentStatus) {
        updateData["teacherProfile.applicationStatus"] = applicationStatus;
        changes.push(`status: ${currentStatus} → ${applicationStatus}`);

        // Set date fields based on status
        const now = new Date();
        if (applicationStatus === "approved") {
          updateData["teacherProfile.approvalDate"] = now;
          updateData["teacherProfile.approvedBy"] = {
            adminId,
            adminName,
            adminEmail: req.user.email,
          };

          // Add teacher role
          if (!user.roles.includes("teacher")) {
            updateData["roles"] = [...user.roles, "teacher"];
            changes.push("role_added: teacher");
          }
        } else if (applicationStatus === "rejected") {
          updateData["teacherProfile.rejectionDate"] = now;
          updateData["teacherProfile.rejectedBy"] = {
            adminId,
            adminName,
            adminEmail: req.user.email,
          };

          // Remove teacher role if present
          if (user.roles.includes("teacher")) {
            updateData["roles"] = user.roles.filter((r) => r !== "teacher");
            changes.push("role_removed: teacher");
          }
        }
      }
    }

    if (commissionRate !== undefined) {
      const rate = Number(commissionRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Commission rate must be between 0 and 100",
          code: "INVALID_COMMISSION_RATE",
        });
      }
      oldValues.commissionRate = user.teacherProfile.commissionRate;
      updateData["teacherProfile.commissionRate"] = rate;
      changes.push("commission_rate");
    }

    if (permissions !== undefined) {
      updateData["teacherProfile.permissions"] = permissions;
      changes.push("permissions");
    }

    if (accessLevel !== undefined) {
      const validLevels = ["basic", "premium", "enterprise"];
      if (!validLevels.includes(accessLevel)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Invalid access level. Must be one of: ${validLevels.join(
            ", ",
          )}`,
          code: "INVALID_ACCESS_LEVEL",
        });
      }
      updateData["teacherProfile.accessLevel"] = accessLevel;
      changes.push("access_level");
    }

    if (adminNotes !== undefined) {
      updateData["teacherProfile.adminNotes"] = adminNotes;
      changes.push("admin_notes");
    }

    if (feedback !== undefined) {
      updateData["teacherProfile.feedback"] = feedback;
      changes.push("feedback");
    }

    // Regular fields that admins can update
    if (bio !== undefined) {
      updateData["teacherProfile.bio"] = bio;
      changes.push("bio");
    }

    if (expertise !== undefined) {
      updateData["teacherProfile.expertise"] = expertise;
      changes.push("expertise");
    }

    if (qualifications !== undefined) {
      updateData["teacherProfile.qualifications"] = qualifications;
      changes.push("qualifications");
    }

    if (experience !== undefined) {
      updateData["teacherProfile.experience"] = experience;
      changes.push("experience");
    }

    if (hourlyRate !== undefined) {
      updateData["teacherProfile.hourlyRate"] = hourlyRate;
      changes.push("hourly_rate");
    }

    if (socialLinks !== undefined) {
      updateData["teacherProfile.socialLinks"] = socialLinks;
      changes.push("social_links");
    }

    if (isVerified !== undefined) {
      updateData["teacherProfile.isVerified"] = isVerified;
      changes.push(`verification: ${isVerified}`);
    }

    if (metadata !== undefined) {
      updateData["teacherProfile.metadata"] = {
        ...user.teacherProfile.metadata,
        ...metadata,
        lastAdminUpdate: new Date(),
        lastUpdatedBy: adminId,
      };
      changes.push("metadata");
    }

    if (settings !== undefined) {
      updateData["teacherProfile.settings"] = {
        ...user.teacherProfile.settings,
        ...settings,
      };
      changes.push("settings");
    }

    // ========================
    // 3. APPLY UPDATES
    // ========================
    if (Object.keys(updateData).length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "No updates provided",
        code: "NO_UPDATES",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        session,
        new: true,
        runValidators: true,
      },
    ).select("name email teacherProfile roles");

    // ========================
    // 4. CREATE AUDIT LOG
    // ========================
    const auditLog = new AuditLog({
      action: "teacher_application_admin_update",
      performedBy: {
        userId: adminId,
        name: adminName,
        role: req.user.role,
        email: req.user.email,
      },
      targetUser: {
        userId: id,
        name: user.name,
        email: user.email,
      },
      changes: changes,
      oldValues,
      newValues: updateData,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        updateCount: changes.length,
        isStatusChange:
          applicationStatus !== undefined &&
          applicationStatus !== user.teacherProfile.applicationStatus,
      },
      timestamp: new Date(),
    });

    await auditLog.save({ session });

    // ========================
    // 5. NOTIFY USER
    // ========================
    if (changes.length > 0) {
      const notification = new Notification({
        userId: id,
        type: "teacher_application_admin_update",
        title: "Teacher Application Updated",
        message: `An administrator has updated your teacher application.`,
        data: {
          updatedBy: adminName,
          changes: changes.slice(0, 5), // Limit to 5 changes
          updatedAt: new Date(),
          applicationStatus: updatedUser.teacherProfile.applicationStatus,
          viewDetails: `/teacher/application`,
        },
        priority: "medium",
        isRead: false,
      });

      await notification.save({ session });

      // Send email for important changes
      if (
        applicationStatus !== undefined &&
        applicationStatus !== user.teacherProfile.applicationStatus
      ) {
        // Status change email would be sent here
        console.log(
          `Status changed for user ${id}: ${user.teacherProfile.applicationStatus} → ${applicationStatus}`,
        );
      }
    }

    // ========================
    // 6. COMMIT TRANSACTION
    // ========================
    await session.commitTransaction();
    session.endSession();

    // ========================
    // 7. RESPONSE
    // ========================
    res.status(200).json({
      success: true,
      message: "Application updated successfully",
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          roles: updatedUser.roles,
        },
        application: {
          status: updatedUser.teacherProfile.applicationStatus,
          isVerified: updatedUser.teacherProfile.isVerified,
          lastUpdated: new Date(),
        },
        changes: {
          count: changes.length,
          fields: changes,
          isStatusChange:
            applicationStatus !== undefined &&
            applicationStatus !== user.teacherProfile.applicationStatus,
        },
        metadata: {
          updatedBy: adminName,
          updatedAt: new Date(),
          transactionId: session.id,
        },
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Admin update application error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update application",
      code: "ADMIN_UPDATE_FAILED",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get application update history
const getApplicationHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";

    // Authorization check
    if (!isAdmin && userId.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
        code: "ACCESS_DENIED",
      });
    }

    // Get audit logs for this application
    const auditLogs = await AuditLog.find({
      $or: [
        { "targetUser.userId": id, action: { $regex: /teacher_application/ } },
        { "performedBy.userId": id, action: { $regex: /teacher_application/ } },
      ],
    })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    // Get user info
    const user = await User.findById(id)
      .select("name email teacherProfile")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          applicationStatus: user.teacherProfile?.applicationStatus,
          applicationDate: user.teacherProfile?.applicationDate,
          lastUpdate: user.teacherProfile?.metadata?.lastProfileUpdate,
        },
        history: auditLogs.map((log) => ({
          id: log._id,
          action: log.action,
          timestamp: log.timestamp,
          performedBy: log.performedBy,
          changes: log.changes,
          metadata: log.metadata,
        })),
        summary: {
          totalUpdates: auditLogs.length,
          userUpdates: auditLogs.filter(
            (log) => log.performedBy.userId.toString() === id,
          ).length,
          adminUpdates: auditLogs.filter(
            (log) =>
              log.performedBy.role === "admin" ||
              log.performedBy.role === "superadmin",
          ).length,
          statusChanges: auditLogs.filter((log) => log.metadata?.isStatusChange)
            .length,
        },
      },
    });
  } catch (error) {
    console.error("Get application history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch application history",
    });
  }
};

// Helper functions
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

const validateDocumentUrls = async (urls, allowedTypes, documentType) => {
  let urlArray;
  try {
    urlArray = Array.isArray(urls) ? urls : JSON.parse(urls);
  } catch {
    throw new Error(`Invalid ${documentType} URLs format`);
  }

  if (!Array.isArray(urlArray)) {
    throw new Error(`${documentType} URLs must be an array`);
  }

  return urlArray.map((item) => {
    if (typeof item === "string") {
      return {
        url: item,
        type: getFileTypeFromUrl(item),
        uploadedAt: new Date(),
      };
    } else if (typeof item === "object" && item.url) {
      if (!allowedTypes.includes(item.type)) {
        throw new Error(
          `Invalid type for ${documentType}. Allowed: ${allowedTypes.join(
            ", ",
          )}`,
        );
      }
      return {
        url: item.url,
        type: item.type,
        filename: item.filename,
        size: item.size,
        uploadedAt: item.uploadedAt ? new Date(item.uploadedAt) : new Date(),
      };
    }
    throw new Error(`Invalid ${documentType} item format`);
  });
};

const getFileTypeFromUrl = (url) => {
  const extension = url.split(".").pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) return "image";
  if (["mp4", "avi", "mov", "wmv"].includes(extension)) return "video";
  if (["pdf"].includes(extension)) return "pdf";
  return "unknown";
};

const calculateApplicationCompleteness = (teacherProfile) => {
  let score = 0;
  let maxScore = 100;

  // Bio (20 points)
  if (teacherProfile.bio && teacherProfile.bio.length >= 50) {
    score += 20;
  }

  // Expertise (15 points)
  if (teacherProfile.expertise && teacherProfile.expertise.length >= 1) {
    score += 15;
  }

  // Qualifications (20 points)
  if (
    teacherProfile.qualifications &&
    teacherProfile.qualifications.length >= 1
  ) {
    score += 20;
  }

  // Experience (20 points)
  if (teacherProfile.experience && teacherProfile.experience.length >= 1) {
    score += 20;
  }

  // Documents (25 points)
  let documentScore = 0;
  if (teacherProfile.media && teacherProfile.media.length >= 1)
    documentScore += 5;
  if (teacherProfile.resumeUrl && teacherProfile.resumeUrl.length >= 1)
    documentScore += 10;
  if (teacherProfile.idProofUrl && teacherProfile.idProofUrl.length >= 1)
    documentScore += 10;
  score += Math.min(documentScore, 25);

  return score;
};

const calculatePriority = (daysPending, completeness) => {
  if (daysPending > 7 && completeness > 80) return "high";
  if (daysPending > 3 && completeness > 60) return "medium";
  return "low";
};

const checkEligibility = (teacherProfile) => {
  const completeness = calculateApplicationCompleteness(teacherProfile);
  return completeness >= 70; // Minimum 70% completeness
};

const getApprovedThisWeekCount = async () => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return await User.countDocuments({
    "teacherProfile.applicationStatus": "approved",
    "teacherProfile.approvalDate": { $gte: oneWeekAgo },
  });
};

const getAverageProcessingTime = async () => {
  const result = await User.aggregate([
    {
      $match: {
        "teacherProfile.applicationStatus": "approved",
        "teacherProfile.applicationDate": { $exists: true },
        "teacherProfile.approvalDate": { $exists: true },
      },
    },
    {
      $project: {
        processingTime: {
          $divide: [
            {
              $subtract: [
                "$teacherProfile.approvalDate",
                "$teacherProfile.applicationDate",
              ],
            },
            1000 * 60 * 60 * 24, // Convert to days
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        avgProcessingTime: { $avg: "$processingTime" },
      },
    },
  ]);

  return result[0]?.avgProcessingTime || 0;
};

module.exports = {
  approveApplication,
  rejectApplication,
  getApplicationById,
  getPendingApplications,
  updateApplication,
  adminUpdateApplication,
  getApplicationHistory,
};
