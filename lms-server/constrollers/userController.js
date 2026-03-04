// controllers/adminController.js - Add these functions
const User = require("../models/loginUserModel");
const Course = require("../models/course");
const Enrollment = require("../models/enrollment");
const Order = require("../models/orderCourse");

const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      role = "",
      status = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      query.role = role;
    }

    if (status === "active") {
      query.lastLogin = {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      };
    } else if (status === "inactive") {
      query.lastLogin = {
        $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get users with pagination
    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(limitNum)
        .select("-password")
        .lean(),
      User.countDocuments(query),
    ]);

    // Enrich user data with stats
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const [enrollments, courses, orders] = await Promise.all([
          Enrollment.countDocuments({ student: user._id }),
          Course.countDocuments({ instructor: user._id }),
          Order.countDocuments({ user: user._id, paymentStatus: "completed" }),
        ]);

        return {
          ...user,
          stats: {
            enrollments,
            courses,
            orders,
          },
          status:
            user.lastLogin &&
            new Date() - user.lastLogin < 30 * 24 * 60 * 60 * 1000
              ? "active"
              : "inactive",
        };
      }),
    );

    res.json({
      success: true,
      users: enrichedUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
    });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password").lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Get user statistics
    const [enrollments, createdCourses, totalSpent, recentActivity, avgRating] =
      await Promise.all([
        // Enrollments
        Enrollment.find({ student: id })
          .populate("course", "title thumbnail")
          .sort({ enrolledAt: -1 })
          .limit(5)
          .lean(),

        // Created courses (if instructor)
        user.role === "instructor"
          ? Course.find({ instructor: id })
              .select("title thumbnail status totalEnrollments averageRating")
              .lean()
          : [],

        // Total spent
        Order.aggregate([
          {
            $match: {
              user: user._id,
              paymentStatus: "completed",
            },
          },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]),

        // Recent activity
        Enrollment.find({ student: id })
          .populate("course", "title")
          .sort({ lastAccessedAt: -1 })
          .limit(10)
          .select("lastAccessedAt course progress.completionPercentage")
          .lean(),

        // Average rating (for instructors)
        user.role === "instructor"
          ? Course.aggregate([
              { $match: { instructor: user._id } },
              { $group: { _id: null, avgRating: { $avg: "$averageRating" } } },
            ])
          : null,
      ]);

    res.json({
      success: true,
      user: {
        ...user,
        stats: {
          totalEnrollments: enrollments.length,
          totalCoursesCreated: createdCourses.length,
          totalSpent: totalSpent[0]?.total || 0,
          averageRating: avgRating?.[0]?.avgRating || 0,
        },
        enrollments,
        createdCourses,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user details",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove sensitive fields
    delete updates.password;
    delete updates.email;
    delete updates._id;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update user",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { action = "soft" } = req.query; // soft or hard

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (action === "hard") {
      // Hard delete - remove user completely
      await User.findByIdAndDelete(id);
      // Note: You might want to handle related data cleanup
    } else {
      // Soft delete
      user.status = "deleted";
      user.deletedAt = new Date();
      await user.save();
    }

    res.json({
      success: true,
      message: `User ${
        action === "hard" ? "permanently deleted" : "deactivated"
      } successfully`,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete user",
    });
  }
};

const bulkUserActions = async (req, res) => {
  try {
    const { userIds, action } = req.body;

    if (!userIds || !userIds.length) {
      return res.status(400).json({
        success: false,
        error: "No users selected",
      });
    }

    let updateQuery = {};
    let message = "";

    switch (action) {
      case "activate":
        updateQuery = { status: "active" };
        message = "Users activated successfully";
        break;
      case "deactivate":
        updateQuery = { status: "inactive" };
        message = "Users deactivated successfully";
        break;
      case "make_instructor":
        updateQuery = { role: "instructor" };
        message = "Users promoted to instructor";
        break;
      case "make_student":
        updateQuery = { role: "student" };
        message = "Users set as students";
        break;
      default:
        return res.status(400).json({
          success: false,
          error: "Invalid action",
        });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: updateQuery },
    );

    res.json({
      success: true,
      message,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Bulk action error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to perform bulk action",
    });
  }
};

const exportUsers = async (req, res) => {
  try {
    const { format = "csv" } = req.query;

    const users = await User.find({})
      .select("name email role createdAt lastLogin status")
      .lean();

    if (format === "csv") {
      // Convert to CSV
      const csvData = [
        ["Name", "Email", "Role", "Created At", "Last Login", "Status"],
        ...users.map((user) => [
          user.name,
          user.email,
          user.role,
          new Date(user.createdAt).toLocaleDateString(),
          user.lastLogin
            ? new Date(user.lastLogin).toLocaleDateString()
            : "Never",
          user.status || "active",
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=users.csv");
      res.send(csvData);
    } else if (format === "json") {
      res.json({
        success: true,
        data: users,
        exportedAt: new Date(),
        total: users.length,
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Invalid format. Use csv or json",
      });
    }
  } catch (error) {
    console.error("Export users error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to export users",
    });
  }
};

module.exports = {
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  bulkUserActions,
  exportUsers,
};
