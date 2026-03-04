// controllers/adminCourseController.js
const Course = require("../models/course");
const Transaction = require("../models/enrollment");
const User = require("../models/loginUserModel");
const Enrollment = require("../models/enrollment");
const TeacherProfile = require("../models/teacherProfile");
const {
  sendTeacherApprovalEmail,
  sendTeacherRejectionEmail,
} = require("./emailNotifications");

// Get all teacher applications
const getAllTeacherApplications = async (req, res) => {
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
      "teacherProfile.isApplied": true,
    };

    // Filter by status
    if (status !== "all") {
      query["teacherProfile.applicationStatus"] = status;
    }

    // Search by name, email, or bio
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "teacherProfile.bio": { $regex: search, $options: "i" } },
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
    const applications = await User.find(query)
      .select("name email phone avatar createdAt teacherProfile")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Get statistics
    const stats = {
      total: await User.countDocuments({ "teacherProfile.isApplied": true }),
      pending: await User.countDocuments({
        "teacherProfile.applicationStatus": "pending",
      }),
      approved: await User.countDocuments({
        "teacherProfile.applicationStatus": "approved",
      }),
      rejected: await User.countDocuments({
        "teacherProfile.applicationStatus": "rejected",
      }),
    };

    res.status(200).json({
      success: true,
      data: {
        applications,
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
// Get single application details
const getApplicationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select("name email phone avatar createdAt role teacherProfile")
      .lean();

    if (!user || !user.teacherProfile?.isApplied) {
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
// Approve teacher application
const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes, commissionRate = 70 } = req.body;

    const user = await User.findById(id);

    if (!user || !user.teacherProfile?.isApplied) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Check if already approved
    if (user.teacherProfile.applicationStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "Application already approved",
      });
    }

    // Check if rejected
    if (user.teacherProfile.applicationStatus === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Cannot approve a rejected application",
      });
    }

    // Update user
    user.roles = "teacher";
    user.teacherProfile.applicationStatus = "approved";
    user.teacherProfile.approvalDate = new Date();
    user.teacherProfile.adminNotes = adminNotes;
    user.teacherProfile.commissionRate = commissionRate;

    await user.save();

    // Send approval email
    await sendTeacherApprovalEmail(user.email, {
      userName: user.name,
      approvalDate: new Date().toLocaleDateString(),
      adminNotes,
      commissionRate,
    });

    res.status(200).json({
      success: true,
      message: "Application approved successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        newRole: user.role,
        applicationStatus: user.teacherProfile.applicationStatus,
      },
    });
  } catch (error) {
    console.error("Approve application error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve application",
    });
  }
};

// Reject teacher application
const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, feedback } = req.body;

    const user = await User.findById(id);

    if (!user || !user.teacherProfile?.isApplied) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Check if already rejected
    if (user.teacherProfile.applicationStatus === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Application already rejected",
      });
    }

    // Check if approved
    if (user.teacherProfile.applicationStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "Cannot reject an approved application",
      });
    }

    // Update user
    user.teacherProfile.applicationStatus = "rejected";
    user.teacherProfile.rejectionDate = new Date();
    user.teacherProfile.rejectionReason = reason;
    user.teacherProfile.feedback = feedback;

    await user.save();

    // Send rejection email
    await sendTeacherRejectionEmail(user.email, {
      userName: user.name,
      reason,
      feedback,
      canReapplyDate: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toLocaleDateString(),
    });

    res.status(200).json({
      success: true,
      message: "Application rejected successfully",
      data: {
        id: user._id,
        name: user.name,
        applicationStatus: user.teacherProfile.applicationStatus,
      },
    });
  } catch (error) {
    console.error("Reject application error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject application",
    });
  }
};

// Bulk actions on applications
const bulkActionApplications = async (req, res) => {
  try {
    const { action, applicationIds, reason } = req.body;

    if (!action || !applicationIds || !Array.isArray(applicationIds)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
      });
    }

    let updateData = {};
    let message = "";

    switch (action) {
      case "approve":
        updateData = {
          "teacherProfile.applicationStatus": "approved",
          "teacherProfile.approvalDate": new Date(),
          role: "teacher",
        };
        message = "Applications approved successfully";
        break;

      case "reject":
        updateData = {
          "teacherProfile.applicationStatus": "rejected",
          "teacherProfile.rejectionDate": new Date(),
          "teacherProfile.rejectionReason": reason || "Not specified",
        };
        message = "Applications rejected successfully";
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid action",
        });
    }

    // Update all applications
    const result = await User.updateMany(
      {
        _id: { $in: applicationIds },
        "teacherProfile.isApplied": true,
      },
      { $set: updateData },
    );

    // Send emails for each action
    if (action === "approve" || action === "reject") {
      const users = await User.find({ _id: { $in: applicationIds } });

      for (const user of users) {
        if (action === "approve") {
          await sendTeacherApprovalEmail(user.email, {
            userName: user.name,
            approvalDate: new Date().toLocaleDateString(),
          });
        } else {
          await sendTeacherRejectionEmail(user.email, {
            userName: user.name,
            reason: reason || "Not specified",
            canReapplyDate: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toLocaleDateString(),
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message,
      data: {
        modifiedCount: result.modifiedCount,
        action,
      },
    });
  } catch (error) {
    console.error("Bulk action error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to perform bulk action",
    });
  }
};

// Get application statistics
const getApplicationStats = async (req, res) => {
  try {
    const today = new Date();
    const lastWeek = new Date(today.setDate(today.getDate() - 7));

    // Get daily applications for last 7 days
    const dailyStats = await User.aggregate([
      {
        $match: {
          "teacherProfile.isApplied": true,
          "teacherProfile.applicationDate": { $gte: lastWeek },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$teacherProfile.applicationDate",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get status distribution
    const statusStats = await User.aggregate([
      {
        $match: { "teacherProfile.isApplied": true },
      },
      {
        $group: {
          _id: "$teacherProfile.applicationStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get top expertise
    const expertiseStats = await User.aggregate([
      {
        $match: { "teacherProfile.isApplied": true },
      },
      {
        $unwind: "$teacherProfile.expertise",
      },
      {
        $group: {
          _id: "$teacherProfile.expertise",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        dailyStats,
        statusStats,
        expertiseStats,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
    });
  }
};
/* =============================================
   TEACHER MANAGEMENT CONTROLLERS
============================================= */

// Get all teachers

const getAllTeachers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const teachers = await User.aggregate([
      // 1️⃣ Only teachers
      { $match: { role: "teacher" } },

      // 2️⃣ Join TeacherProfile using user field
      {
        $lookup: {
          from: "teacherprofiles", // 👈 collection name (important)
          localField: "_id", // User._id
          foreignField: "user", // TeacherProfile.user
          as: "teacherProfile",
        },
      },

      // 3️⃣ Convert array → object
      {
        $unwind: {
          path: "$teacherProfile",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 4️⃣ Pick ONLY admin-needed fields
      {
        $project: {
          name: 1,
          email: 1,
          phoneNumber: 1,
          avatar: 1,
          media: 1,
          isActive: 1,
          createdAt: 1,

          applicationStatus: "$teacherProfile.applicationStatus",
          isVerified: "$teacherProfile.verification.isVerified",
          assignedClasses: "$teacherProfile.assignedClasses",
        },
      },

      // 5️⃣ Pagination
      { $skip: skip },
      { $limit: Number(limit) },
    ]);

    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teachers",
    });
  }
};

// Get teacher by ID
const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await User.findById(id)
      .select("name email avatar phone isActive createdAt teacherProfile roles")
      .populate("teacherProfile.qualifications.certificateUrl")
      .populate("teacherProfile.resumeUrl")
      .populate("teacherProfile.idProofUrl")
      .populate("teacherProfile.media");

    if (!teacher || !teacher.roles.includes("teacher")) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Get teacher stats
    const courses = await Course.find({ instructor: id })
      .select("title category price studentsEnrolled rating status createdAt")
      .sort({ createdAt: -1 });

    const totalCourses = courses.length;
    const totalStudents = courses.reduce(
      (sum, course) => sum + (course.studentsEnrolled || 0),
      0,
    );

    const enrollments = await Enrollment.find({
      course: { $in: courses.map((c) => c._id) },
    });

    const totalRevenue = enrollments.reduce(
      (sum, enrollment) => sum + (enrollment.amountPaid || 0),
      0,
    );

    // Get reviews for teacher's courses
    const reviews = await Review.find({
      course: { $in: courses.map((c) => c._id) },
    })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .limit(10);

    const response = {
      success: true,
      data: {
        teacher,
        stats: {
          totalCourses,
          totalStudents,
          totalRevenue,
          averageRating: teacher.teacherProfile?.rating || 0,
          totalReviews: reviews.length,
        },
        courses: courses.slice(0, 5), // Last 5 courses
        recentReviews: reviews,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching teacher details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching teacher details",
      error: error.message,
    });
  }
};

// Get teacher courses
const getTeacherCourses = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Verify teacher exists
    const teacher = await User.findById(id);
    if (!teacher || !teacher.roles.includes("teacher")) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Build filter
    const filter = { instructor: id };
    if (status && status !== "all") {
      filter.status = status;
    }

    // Pagination
    const skip = (page - 1) * limit;

    const courses = await Course.find(filter)
      .select(
        "title category price studentsEnrolled rating status createdAt thumbnail",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching teacher courses:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching teacher courses",
      error: error.message,
    });
  }
};

// Update teacher status (activate/deactivate)
const updateTeacherStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const teacher = await User.findById(id);
    if (!teacher || !teacher.roles.includes("teacher")) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Update status
    teacher.isActive = status === "active";

    // Add status change history
    if (!teacher.statusHistory) {
      teacher.statusHistory = [];
    }

    teacher.statusHistory.push({
      status: status === "active" ? "active" : "inactive",
      changedAt: new Date(),
      changedBy: req.user._id,
      reason: reason || "Admin action",
    });

    await teacher.save();

    res.json({
      success: true,
      message: `Teacher ${
        status === "active" ? "activated" : "deactivated"
      } successfully`,
      data: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        isActive: teacher.isActive,
        updatedAt: teacher.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating teacher status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating teacher status",
      error: error.message,
    });
  }
};

// Search teachers
const searchTeachers = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const filter = {
      roles: "teacher",
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { "teacherProfile.bio": { $regex: query, $options: "i" } },
        { "teacherProfile.expertise": { $regex: query, $options: "i" } },
      ],
    };

    const skip = (page - 1) * limit;

    const teachers = await User.find(filter)
      .select("name email avatar teacherProfile")
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        teachers,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error searching teachers:", error);
    res.status(500).json({
      success: false,
      message: "Error searching teachers",
      error: error.message,
    });
  }
};

// Bulk update teacher status
const bulkUpdateTeacherStatus = async (req, res) => {
  try {
    const { teacherIds, status, reason } = req.body;

    if (!teacherIds || !Array.isArray(teacherIds) || !status) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
      });
    }

    const updateData = {
      isActive: status === "active",
      $push: {
        statusHistory: {
          status: status === "active" ? "active" : "inactive",
          changedAt: new Date(),
          changedBy: req.user._id,
          reason: reason || "Bulk admin action",
        },
      },
    };

    const result = await User.updateMany(
      {
        _id: { $in: teacherIds },
        roles: "teacher",
      },
      updateData,
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} teachers updated successfully`,
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error("Error updating teacher status in bulk:", error);
    res.status(500).json({
      success: false,
      message: "Error updating teacher status",
      error: error.message,
    });
  }
};
// Get admin dashboard statistics
const getAdminDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get counts in parallel for better performance
    const [
      totalUsers,
      totalInstructors,
      totalStudents,
      totalCourses,
      publishedCourses,
      pendingCourses,
      totalEnrollments,
      activeUsers,
      pendingWithdrawals,
    ] = await Promise.all([
      // User counts
      User.countDocuments(),
      User.countDocuments({ role: "teacher" }),
      User.countDocuments({ role: "student" }),

      // Course counts
      Course.countDocuments(),
      Course.countDocuments({ status: "published" }),
      Course.countDocuments({ status: "pending" }),

      // Enrollment count
      Enrollment.countDocuments(),

      // Active users (users who logged in last 24 hours)
      User.countDocuments({
        lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),

      // Pending withdrawals
      Transaction.countDocuments({ type: "withdrawal", status: "pending" }),
    ]);

    // Get revenue data
    const revenueResult = await Transaction.aggregate([
      {
        $match: {
          type: "payment",
          status: "completed",
          createdAt: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          todayRevenue: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", startOfToday] }, "$amount", 0],
            },
          },
        },
      },
    ]);

    // Get recent enrollments
    const recentEnrollments = await Enrollment.find()
      .populate("student", "name email")
      .populate("course", "title")
      .sort({ enrolledAt: -1 })
      .limit(5)
      .lean();

    // Get recent courses
    const recentCourses = await Course.find()
      .populate("instructor", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title instructor createdAt")
      .lean();

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email role createdAt")
      .lean();

    // Calculate platform health (simplified)
    const platformHealth = 100; // In real app, calculate based on uptime, errors, etc.

    const stats = {
      totalUsers,
      totalInstructors,
      totalStudents,
      totalCourses,
      publishedCourses,
      pendingCourses,
      totalEnrollments,
      totalRevenue: revenueResult[0]?.totalRevenue || 0,
      todayRevenue: revenueResult[0]?.todayRevenue || 0,
      activeUsers,
      pendingWithdrawals,
      platformHealth,
      recentEnrollments: recentEnrollments.map((enrollment) => ({
        userName: enrollment.student?.name || "Unknown",
        courseTitle: enrollment.course?.title || "Unknown",
        enrolledAt: enrollment.enrolledAt,
      })),
      recentCourses: recentCourses.map((course) => ({
        title: course.title,
        instructor: course.instructor?.name || "Unknown",
        createdAt: course.createdAt,
      })),
      recentUsers: recentUsers.map((user) => ({
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })),
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};
// Get teacher statistics
const getTeacherStats = async (req, res) => {
  try {
    const totalTeachers = await User.countDocuments({ roles: "teacher" });
    const activeTeachers = await User.countDocuments({
      roles: "teacher",
      isActive: true,
    });
    const verifiedTeachers = await User.countDocuments({
      roles: "teacher",
      "teacherProfile.isVerified": true,
    });
    const newTeachers = await User.countDocuments({
      roles: "teacher",
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    });

    // Get top performing teachers
    const topTeachers = await User.aggregate([
      { $match: { roles: "teacher" } },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "instructor",
          as: "courses",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          avatar: 1,
          totalCourses: { $size: "$courses" },
          totalStudents: { $sum: "$courses.studentsEnrolled" },
          totalRevenue: { $sum: "$courses.price" },
          averageRating: { $avg: "$courses.rating" },
        },
      },
      { $sort: { totalStudents: -1 } },
      { $limit: 5 },
    ]);

    const stats = {
      total: totalTeachers,
      active: activeTeachers,
      inactive: totalTeachers - activeTeachers,
      verified: verifiedTeachers,
      unverified: totalTeachers - verifiedTeachers,
      newLast30Days: newTeachers,
      topTeachers,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching teacher stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching teacher stats",
      error: error.message,
    });
  }
};
// Get all courses (admin)
const getAllCourses = async (req, res) => {
  try {
    const {
      category,
      search,
      status,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    let query = {};

    // Apply filters
    if (category && category !== "all") query.category = category;
    if (status && status !== "all") query.status = status;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "instructor.name": { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const courses = await Course.find(query)
      .populate("instructor", "name email")

      .limit(Number(limit))
      .skip((page - 1) * limit)
      .sort(sort);

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

// Get all courses status for admin dashboard - Simple Version
const getAllCoursesStatus = async (req, res) => {
  try {
    // Get basic course counts (parallel execution for better performance)
    const [totalCourses, publishedCourses, draftCourses, pendingCourses] =
      await Promise.all([
        Course.countDocuments(),
        Course.countDocuments({ status: "published" }),
        Course.countDocuments({ status: "draft" }),
        Course.countDocuments({ status: "pending" }),
      ]);

    const stats = {
      overview: {
        total: totalCourses,
        published: publishedCourses,
        draft: draftCourses,
        pending: pendingCourses,
        approved: totalCourses - pendingCourses, // പ്രസിദ്ധീകരിച്ചത് + draft
      },
      summary: `${totalCourses} total courses (${publishedCourses} published, ${draftCourses} draft, ${pendingCourses} pending)`,
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching course stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching course statistics",
      error: error.message,
    });
  }
};
// Get course by ID (admin)
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "instructor",
      "name email",
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending courses for approval
const getPendingCourses = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const courses = await Course.find({ status: "pending" })
      .populate("instructor", "name email")
      .limit(Number(limit))
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments({ status: "pending" });

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

// Approve course
const approveCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.status !== "pending") {
      return res.status(400).json({
        message: `Course is already ${course.status}`,
      });
    }

    course.status = "published";
    await course.save();

    // Optionally send notification to instructor
    res.json({
      message: "Course approved successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject course
const rejectCourse = async (req, res) => {
  try {
    const { reason } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.status !== "pending") {
      return res.status(400).json({
        message: `Course is already ${course.status}`,
      });
    }

    course.status = "rejected";
    course.rejectionReason = reason;
    await course.save();

    // Optionally send notification to instructor
    res.json({
      message: "Course rejected successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update course status
const updateCourseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "draft",
      "pending",
      "published",
      "archived",
      "rejected",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    ).populate("instructor", "name email");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({
      message: "Course status updated successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete course (admin)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get admin dashboard stats
const getAdminStats = async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({
      status: "published",
    });
    const pendingCourses = await Course.countDocuments({ status: "pending" });
    const draftCourses = await Course.countDocuments({ status: "draft" });

    // Get total enrollments
    const allCourses = await Course.find().select("students");
    const totalEnrollments = allCourses.reduce((acc, course) => {
      return acc + (course.students?.length || 0);
    }, 0);

    // Get total revenue
    const revenueCourses = await Course.find({
      status: "published",
      enrollmentType: "paid",
    }).select("price students");

    const totalRevenue = revenueCourses.reduce((acc, course) => {
      const enrollments = course.students?.length || 0;
      const price = course.price || 0;
      return acc + price * enrollments;
    }, 0);

    // Get total instructors
    const totalInstructors = await User.countDocuments({ role: "instructor" });

    // Get total students
    const totalStudents = await User.countDocuments({ role: "student" });

    // Get recent courses
    const recentCourses = await Course.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("instructor", "name")
      .select("title instructor status createdAt");

    res.json({
      totalCourses,
      publishedCourses,
      pendingCourses,
      draftCourses,
      totalEnrollments,
      totalRevenue,
      totalInstructors,
      totalStudents,
      recentCourses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get course analytics
const getCourseAnalytics = async (req, res) => {
  try {
    const courseId = req.params.id;

    const course = await Course.findById(courseId)
      .populate("students", "name email enrolledAt")
      .populate("reviews.user", "name");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Enrollment trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEnrollments =
      course.students?.filter((student) => {
        return (
          student.enrolledAt && new Date(student.enrolledAt) > thirtyDaysAgo
        );
      }) || [];

    const enrollmentTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const enrollments =
        course.students?.filter((student) => {
          if (!student.enrolledAt) return false;
          const enrolledDate = new Date(student.enrolledAt);
          return enrolledDate >= dayStart && enrolledDate <= dayEnd;
        }) || [];

      enrollmentTrend.push({
        date: dayStart.toISOString().split("T")[0],
        count: enrollments.length,
      });
    }

    // Rating distribution
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    course.reviews?.forEach((review) => {
      ratingDistribution[review.rating]++;
    });

    // Calculate average rating
    const totalRatings = course.reviews?.length || 0;
    const averageRating =
      totalRatings > 0
        ? course.reviews.reduce((acc, review) => acc + review.rating, 0) /
          totalRatings
        : 0;

    const analytics = {
      courseId: course._id,
      courseTitle: course.title,
      totalEnrollments: course.students?.length || 0,
      totalRevenue: (course.price || 0) * (course.students?.length || 0),
      totalReviews: totalRatings,
      averageRating: parseFloat(averageRating.toFixed(1)),
      recentEnrollments: recentEnrollments.length,
      enrollmentTrend,
      ratingDistribution,
      completionRate: 0, // You can add progress tracking
      studentDemographics: {
        // You can add age, location, etc. if you have the data
      },
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get popular courses
const getPopularCourses = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const popularCourses = await Course.aggregate([
      { $match: { status: "published" } },
      {
        $project: {
          title: 1,
          instructor: 1,
          thumbnail: 1,
          price: 1,
          category: 1,
          enrollmentCount: { $size: { $ifNull: ["$students", []] } },
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ["$reviews", []] } }, 0] },
              then: { $avg: "$reviews.rating" },
              else: 0,
            },
          },
        },
      },
      { $sort: { enrollmentCount: -1, averageRating: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "users",
          localField: "instructor",
          foreignField: "_id",
          as: "instructorInfo",
        },
      },
      {
        $unwind: { path: "$instructorInfo", preserveNullAndEmptyArrays: true },
      },
    ]);

    res.json(popularCourses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  getPendingCourses,
  approveCourse,
  rejectCourse,
  updateCourseStatus,
  deleteCourse,
  getAdminStats,
  getCourseAnalytics,
  getPopularCourses,
  getAllTeacherApplications,
  getApplicationDetails,
  approveApplication,
  rejectApplication,
  bulkActionApplications,
  getApplicationStats,
  getAllTeachers,
  getTeacherById,
  getTeacherStats,
  updateTeacherStatus,
  getTeacherCourses,
  searchTeachers,
  bulkUpdateTeacherStatus,
  getAdminDashboardStats,
  getAllCoursesStatus,
};
// https://res.cloudinary.com/dmfaaroor/video/upload/v1765965982/Enna_Solla_Pogirai_Official_Video_Song_Kandukondain_Kandukondain_Ajith_Kumar_AR_Rahman_Tabu_1765965890373.mp4
// https://res.cloudinary.com/dmfaaroor/video/upload/v1765553771/_viralshorts_likeforlikes_subscribemychannel_1765553503612.mp4
// https://res.cloudinary.com/dmfaaroor/video/upload/v1765553412/_._-__1765553402333.mp4
// https://res.cloudinary.com/dmfaaroor/video/upload/v1765553092/_status_video_-_shorts_1765553084596.mp4
// https://res.cloudinary.com/dmfaaroor/video/upload/v1765552513/_shortvideo_shorts_short_shortsfeed_christmas_like_viral_subscribe_1765552492838.mp4
