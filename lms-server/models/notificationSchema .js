const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    // ⭐ RECIPIENT
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ⭐ NOTIFICATION CONTENT
    type: {
      type: String,
      required: true,
      index: true,
      enum: [
        // System notifications
        "system_announcement",
        "system_update",
        "maintenance",
        "welcome",

        // User notifications
        "profile_update",
        "password_change",
        "email_verification",
        "account_verification",

        // Teacher notifications
        "teacher_application_submitted",
        "teacher_application_approved",
        "teacher_application_rejected",
        "teacher_application_update",
        "teacher_application_resubmitted",
        "teacher_profile_approved",
        "teacher_course_approved",
        "teacher_course_rejected",
        "teacher_payment_received",
        "teacher_withdrawal_processed",

        // Course notifications
        "course_enrolled",
        "course_completed",
        "course_certificate",
        "course_review_added",
        "course_question_answered",
        "course_announcement",
        "course_update",
        "course_expiring",

        // Video notifications
        "video_uploaded",
        "video_processed",
        "video_comment",
        "video_like",
        "video_reply",

        // Learning notifications
        "learning_reminder",
        "learning_goal_achieved",
        "learning_streak",
        "learning_recommendation",
        "assignment_due",
        "quiz_result",

        // Social notifications
        "follow",
        "message",
        "comment",
        "reply",
        "mention",
        "share",

        // Payment notifications
        "payment_success",
        "payment_failed",
        "payment_refund",
        "subscription_renewal",
        "subscription_expiring",
        "invoice_generated",

        // Admin notifications
        "admin_alert",
        "user_report",
        "content_report",
        "system_alert",
        "backup_complete",

        // Marketing notifications
        "promotion",
        "discount",
        "new_course",
        "course_recommendation",
        "wishlist_price_drop",

        // Custom notifications
        "custom",
      ],
      default: "custom",
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    // ⭐ NOTIFICATION DATA
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },

    // ⭐ VISUAL ELEMENTS
    icon: {
      type: String,
      default: "🔔",
    },

    image: {
      type: String,
      default: "",
    },

    color: {
      type: String,
      default: "#3B82F6", // Blue-500
    },

    // ⭐ DELIVERY & DISPLAY
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true,
    },

    category: {
      type: String,
      enum: [
        "system",
        "learning",
        "social",
        "payment",
        "marketing",
        "admin",
        "other",
      ],
      default: "system",
      index: true,
    },

    channels: [
      {
        type: String,
        enum: ["in_app", "email", "sms", "push", "webhook"],
        default: ["in_app"],
      },
    ],

    // ⭐ STATUS
    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "read", "failed", "archived"],
      default: "pending",
      index: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ⭐ DELIVERY INFO
    delivery: {
      sentAt: Date,
      deliveredAt: Date,
      readAt: Date,
      failedAt: Date,
      failureReason: String,
      retryCount: {
        type: Number,
        default: 0,
        max: 5,
      },
    },

    // ⭐ EXPIRY & SCHEDULING
    expiresAt: {
      type: Date,
      index: true,
    },

    scheduledFor: {
      type: Date,
      index: true,
    },

    // ⭐ METADATA
    metadata: {
      source: String,
      campaignId: String,
      templateId: String,
      version: String,
      tags: [String],
      locale: {
        type: String,
        default: "en",
      },
      deviceInfo: {
        platform: String,
        browser: String,
        isMobile: Boolean,
      },
    },

    // ⭐ ACTION BUTTONS
    actions: [
      {
        label: String,
        action: String,
        url: String,
        method: String,
        color: String,
        confirmText: String,
      },
    ],

    // ⭐ RELATIONSHIPS
    relatedTo: {
      entityType: {
        type: String,
        enum: ["user", "course", "video", "payment", "content", "system"],
      },
      entityId: Schema.Types.ObjectId,
    },

    // ⭐ TIMESTAMPS
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ⭐ INDEXES
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 }); // User notifications
notificationSchema.index({ userId: 1, status: 1, createdAt: -1 }); // User notification status
notificationSchema.index({ type: 1, createdAt: -1 }); // Notification type tracking
notificationSchema.index({ priority: 1, createdAt: -1 }); // Priority-based queries
notificationSchema.index({ category: 1, createdAt: -1 }); // Category-based queries
notificationSchema.index({ scheduledFor: 1, status: 1 }); // Scheduled notifications
notificationSchema.index({ expiresAt: 1, status: 1 }); // Expired notifications
notificationSchema.index({
  "relatedTo.entityType": 1,
  "relatedTo.entityId": 1,
}); // Related entity queries
notificationSchema.index({ createdAt: -1 }); // Time-based queries
notificationSchema.index({ "metadata.tags": 1 }); // Tag-based queries

// ⭐ COMPOUND INDEXES
notificationSchema.index({
  userId: 1,
  isRead: 1,
  category: 1,
  createdAt: -1,
});

notificationSchema.index({
  userId: 1,
  status: 1,
  priority: 1,
  createdAt: -1,
});

// ⭐ VIRTUAL FIELDS
notificationSchema.virtual("formattedDate").get(function () {
  const now = new Date();
  const diffMs = now - this.createdAt;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return this.createdAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
});

notificationSchema.virtual("isExpired").get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

notificationSchema.virtual("isScheduled").get(function () {
  if (!this.scheduledFor) return false;
  return new Date() < this.scheduledFor;
});

notificationSchema.virtual("canDeliver").get(function () {
  if (this.isArchived) return false;
  if (this.isExpired) return false;
  if (this.isScheduled) return false;
  if (this.status === "failed" && this.delivery.retryCount >= 5) return false;
  return this.status === "pending" || this.status === "failed";
});

// ⭐ PRE-SAVE MIDDLEWARE
notificationSchema.pre("save", function (next) {
  // Set default expiry (30 days)
  if (!this.expiresAt) {
    this.expiresAt = new Date();
    this.expiresAt.setDate(this.expiresAt.getDate() + 30);
  }

  // Update timestamps
  this.updatedAt = new Date();

  // Set read status timestamps
  if (this.isModified("isRead") && this.isRead) {
    this.delivery.readAt = new Date();
    this.status = "read";
  }

  // Set archived status
  if (this.isModified("isArchived") && this.isArchived) {
    this.status = "archived";
  }

  // Add metadata tags if not present
  if (!this.metadata.tags) {
    this.metadata.tags = [];
  }

  // Add notification type as tag
  if (!this.metadata.tags.includes(this.type)) {
    this.metadata.tags.push(this.type);
  }

  // Add priority as tag
  const priorityTag = `priority_${this.priority}`;
  if (!this.metadata.tags.includes(priorityTag)) {
    this.metadata.tags.push(priorityTag);
  }

  next();
});

// ⭐ METHODS
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.delivery.readAt = new Date();
  this.status = "read";
  return this.save();
};

notificationSchema.methods.markAsUnread = function () {
  this.isRead = false;
  this.delivery.readAt = null;
  this.status = "delivered";
  return this.save();
};

notificationSchema.methods.archive = function () {
  this.isArchived = true;
  this.status = "archived";
  return this.save();
};

notificationSchema.methods.unarchive = function () {
  this.isArchived = false;
  this.status = this.isRead ? "read" : "delivered";
  return this.save();
};

notificationSchema.methods.recordDelivery = function (
  channel,
  status = "delivered",
) {
  this.delivery[`${channel}At`] = new Date();
  this.status = status;
  return this.save();
};

notificationSchema.methods.recordFailure = function (reason) {
  this.status = "failed";
  this.delivery.failedAt = new Date();
  this.delivery.failureReason = reason;
  this.delivery.retryCount += 1;
  return this.save();
};

notificationSchema.methods.toClientFormat = function () {
  return {
    id: this._id,
    type: this.type,
    title: this.title,
    message: this.message,
    icon: this.icon,
    image: this.image,
    color: this.color,
    data: this.data,
    actions: this.actions,
    isRead: this.isRead,
    formattedDate: this.formattedDate,
    priority: this.priority,
    category: this.category,
    relatedTo: this.relatedTo,
    createdAt: this.createdAt,
  };
};

// ⭐ STATIC METHODS
notificationSchema.statics.createNotification = async function (data) {
  try {
    const notification = new this({
      userId: data.userId,
      type: data.type || "custom",
      title: data.title,
      message: data.message,
      data: data.data || {},
      icon: data.icon || "🔔",
      image: data.image || "",
      color: data.color || "#3B82F6",
      priority: data.priority || "medium",
      category: data.category || "system",
      channels: data.channels || ["in_app"],
      status: "pending",
      isRead: false,
      isArchived: false,
      delivery: {
        retryCount: 0,
      },
      expiresAt: data.expiresAt,
      scheduledFor: data.scheduledFor,
      metadata: {
        source: data.source,
        campaignId: data.campaignId,
        templateId: data.templateId,
        version: data.version,
        tags: data.tags || [],
        locale: data.locale || "en",
        deviceInfo: data.deviceInfo,
      },
      actions: data.actions || [],
      relatedTo: data.relatedTo || {},
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
};

notificationSchema.statics.getUserNotifications = function (
  userId,
  options = {},
) {
  const {
    limit = 20,
    offset = 0,
    unreadOnly = false,
    category,
    priority,
    startDate,
    endDate,
  } = options;

  const query = { userId, isArchived: false };

  if (unreadOnly) {
    query.isRead = false;
  }

  if (category) {
    query.category = category;
  }

  if (priority) {
    query.priority = priority;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  return this.find(query)
    .sort({
      priority: -1,
      createdAt: -1,
    })
    .skip(offset)
    .limit(limit)
    .lean();
};

notificationSchema.statics.getUnreadCount = function (userId, category) {
  const query = {
    userId,
    isRead: false,
    isArchived: false,
    status: { $in: ["delivered", "sent"] },
  };

  if (category) {
    query.category = category;
  }

  return this.countDocuments(query);
};

notificationSchema.statics.markAllAsRead = function (userId, category) {
  const query = { userId, isRead: false };

  if (category) {
    query.category = category;
  }

  return this.updateMany(query, {
    $set: {
      isRead: true,
      "delivery.readAt": new Date(),
      status: "read",
    },
  });
};

notificationSchema.statics.cleanupExpired = async function () {
  const result = await this.updateMany(
    {
      expiresAt: { $lt: new Date() },
      isArchived: false,
    },
    {
      $set: {
        isArchived: true,
        status: "archived",
      },
    },
  );

  return result.modifiedCount;
};

notificationSchema.statics.getNotificationStats = async function (
  userId,
  period = "30d",
) {
  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case "24h":
      startDate.setHours(now.getHours() - 24);
      break;
    case "7d":
      startDate.setDate(now.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(now.getDate() - 30);
      break;
    default:
      startDate.setDate(now.getDate() - 30);
  }

  const stats = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate, $lte: now },
        isArchived: false,
      },
    },
    {
      $facet: {
        overview: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              unread: {
                $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] },
              },
              read: {
                $sum: { $cond: [{ $eq: ["$isRead", true] }, 1, 0] },
              },
            },
          },
        ],
        byType: [
          {
            $group: {
              _id: "$type",
              count: { $sum: 1 },
              unread: {
                $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] },
              },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ],
        byCategory: [
          {
            $group: {
              _id: "$category",
              count: { $sum: 1 },
              unread: {
                $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] },
              },
            },
          },
          { $sort: { count: -1 } },
        ],
        dailyTrend: [
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              count: { $sum: 1 },
              unread: {
                $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] },
              },
            },
          },
          { $sort: { _id: 1 } },
        ],
      },
    },
  ]);

  return stats[0];
};

// ⭐ BULK OPERATIONS
notificationSchema.statics.createBulkNotifications = async function (
  notificationsData,
) {
  try {
    const notifications = notificationsData.map((data) => ({
      userId: data.userId,
      type: data.type || "custom",
      title: data.title,
      message: data.message,
      data: data.data || {},
      priority: data.priority || "medium",
      category: data.category || "system",
      status: "pending",
      isRead: false,
      isArchived: false,
      createdAt: new Date(),
      expiresAt:
        data.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }));

    const result = await this.insertMany(notifications);
    return result;
  } catch (error) {
    console.error("Failed to create bulk notifications:", error);
    return [];
  }
};

module.exports = mongoose.model("Notification", notificationSchema);
