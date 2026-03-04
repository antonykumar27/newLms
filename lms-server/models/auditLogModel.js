const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const auditLogSchema = new Schema(
  {
    // ⭐ CORE ACTION INFO
    action: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    actionType: {
      type: String,
      required: true,
      enum: [
        // User actions
        "user_register",
        "user_login",
        "user_logout",
        "user_update",
        "user_delete",
        "user_password_change",
        "user_email_change",
        "user_role_change",

        // Teacher actions
        "teacher_apply",
        "teacher_approve",
        "teacher_reject",
        "teacher_update",
        "teacher_suspend",
        "teacher_reactivate",
        "teacher_application_update",
        "teacher_application_resubmit",

        // Course actions
        "course_create",
        "course_update",
        "course_delete",
        "course_publish",
        "course_unpublish",
        "course_archive",
        "course_enroll",
        "course_complete",
        "course_review",

        // Video actions
        "video_create",
        "video_update",
        "video_delete",
        "video_upload",
        "video_view",
        "video_like",
        "video_dislike",
        "video_bookmark",

        // Content actions
        "content_create",
        "content_update",
        "content_delete",
        "content_publish",

        // Payment actions
        "payment_initiated",
        "payment_success",
        "payment_failed",
        "payment_refund",
        "withdrawal_request",
        "withdrawal_approved",
        "withdrawal_rejected",

        // Admin actions
        "admin_login",
        "admin_action",
        "settings_update",
        "system_maintenance",
        "backup_created",
        "cache_cleared",

        // Security actions
        "login_attempt",
        "failed_login",
        "brute_force_attempt",
        "suspicious_activity",
        "ip_blocked",
        "ip_unblocked",

        // API actions
        "api_call",
        "api_error",
        "rate_limit_exceeded",

        // System actions
        "cron_job",
        "email_sent",
        "notification_sent",
        "file_uploaded",
        "file_deleted",

        // Custom actions
        "custom",
      ],
      default: "custom",
    },

    // ⭐ PERFORMED BY (who did it)
    performedBy: {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: String,
      superAdmin: {
        type: String,
        enum: [
          "user",
          "teacher",
          "admin",
          "superadmin",
          "system",
          "api",
          "superAdmin",
        ],

        default: "user",
      },
      ipAddress: String,
      userAgent: String,
    },

    // ⭐ TARGET (what was affected)
    targetUser: {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      name: String,
      email: String,
      role: String,
    },

    targetEntity: {
      type: {
        type: String,
        enum: [
          "user",
          "course",
          "video",
          "payment",
          "content",
          "system",
          "other",
        ],
      },
      id: Schema.Types.ObjectId,
      name: String,
      reference: String,
    },

    // ⭐ CHANGES MADE
    changes: {
      before: {
        type: Schema.Types.Mixed,
        default: null,
      },
      after: {
        type: Schema.Types.Mixed,
        default: null,
      },
      fieldsChanged: [String],
      diff: {
        type: Schema.Types.Mixed,
        default: null,
      },
    },

    // ⭐ METADATA
    metadata: {
      requestId: String,
      sessionId: String,
      deviceId: String,
      location: {
        country: String,
        city: String,
        region: String,
        latitude: Number,
        longitude: Number,
      },
      duration: Number, // ms
      status: {
        type: String,
        enum: ["success", "failed", "partial", "pending"],
        default: "success",
      },
      error: {
        code: String,
        message: String,
        stack: String,
      },
      tags: [String],
      priority: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "medium",
      },
    },

    // ⭐ SECURITY & COMPLIANCE
    securityLevel: {
      type: String,
      enum: ["public", "internal", "confidential", "restricted"],
      default: "internal",
    },

    compliance: {
      gdpr: Boolean,
      hipaa: Boolean,
      pci: Boolean,
      retentionPeriod: Number, // days
    },

    // ⭐ TIMESTAMPS
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },

    expiresAt: {
      type: Date,
      index: true,
      expires: 0, // Will be set based on retention
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ⭐ INDEXES
auditLogSchema.index({ "performedBy.userId": 1, timestamp: -1 }); // User activity
auditLogSchema.index({ "targetUser.userId": 1, timestamp: -1 }); // Target user activity
auditLogSchema.index({ action: 1, timestamp: -1 }); // Action tracking
auditLogSchema.index({ actionType: 1, timestamp: -1 }); // Action type tracking
auditLogSchema.index({ "metadata.status": 1, timestamp: -1 }); // Status tracking
auditLogSchema.index({ "metadata.priority": 1, timestamp: -1 }); // Priority filtering
auditLogSchema.index({ "performedBy.ipAddress": 1, timestamp: -1 }); // IP tracking
auditLogSchema.index({ timestamp: -1 }); // Time-based queries
auditLogSchema.index({ "metadata.tags": 1 }); // Tag-based queries
auditLogSchema.index({ securityLevel: 1 }); // Security filtering

// ⭐ TEXT INDEX FOR SEARCH
auditLogSchema.index({
  action: "text",
  "performedBy.name": "text",
  "targetUser.name": "text",
  "metadata.error.message": "text",
  "metadata.tags": "text",
});

// ⭐ VIRTUAL FIELDS
auditLogSchema.virtual("formattedDate").get(function () {
  return this.timestamp.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
});

auditLogSchema.virtual("isSuccessful").get(function () {
  return this.metadata.status === "success";
});

auditLogSchema.virtual("isFailed").get(function () {
  return this.metadata.status === "failed";
});

auditLogSchema.virtual("durationFormatted").get(function () {
  if (!this.metadata.duration) return "N/A";

  const ms = this.metadata.duration;
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
});

// ⭐ PRE-SAVE MIDDLEWARE
auditLogSchema.pre("save", function (next) {
  // Calculate diff if before and after exist
  if (this.changes.before && this.changes.after) {
    this.changes.diff = this.calculateDiff(
      this.changes.before,
      this.changes.after,
    );
  }

  // Set expiration based on security level and compliance
  const retentionPeriods = {
    public: 30, // 30 days
    internal: 365, // 1 year
    confidential: 730, // 2 years
    restricted: 1825, // 5 years
  };

  const retentionDays =
    this.compliance.retentionPeriod ||
    retentionPeriods[this.securityLevel] ||
    365;

  this.expiresAt = new Date();
  this.expiresAt.setDate(this.expiresAt.getDate() + retentionDays);

  // Add timestamp for compliance
  if (!this.metadata.tags) {
    this.metadata.tags = [];
  }

  // Add year and month tags for easier querying
  const year = this.timestamp.getFullYear();
  const month = this.timestamp.getMonth() + 1;
  this.metadata.tags.push(`year_${year}`, `month_${month}`);

  next();
});

// ⭐ METHODS
auditLogSchema.methods.calculateDiff = function (before, after) {
  const diff = {};

  // Simple diff calculation
  for (const key in after) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      diff[key] = {
        before: before[key],
        after: after[key],
        changed: true,
      };
    }
  }

  // Check for removed fields
  for (const key in before) {
    if (!(key in after)) {
      diff[key] = {
        before: before[key],
        after: null,
        removed: true,
      };
    }
  }

  return diff;
};

auditLogSchema.methods.toAuditFormat = function () {
  return {
    id: this._id,
    action: this.action,
    actionType: this.actionType,
    performedBy: this.performedBy,
    target: {
      user: this.targetUser,
      entity: this.targetEntity,
    },
    changes: {
      fields: this.changes.fieldsChanged,
      diff: this.changes.diff,
      hasChanges:
        this.changes.fieldsChanged && this.changes.fieldsChanged.length > 0,
    },
    metadata: {
      status: this.metadata.status,
      priority: this.metadata.priority,
      duration: this.metadata.duration,
      formattedDate: this.formattedDate,
      location: this.metadata.location,
      tags: this.metadata.tags,
    },
    timestamp: this.timestamp,
    formattedDate: this.formattedDate,
    isSuccessful: this.isSuccessful,
    securityLevel: this.securityLevel,
  };
};

// ⭐ STATIC METHODS
auditLogSchema.statics.logAction = async function (data) {
  try {
    const auditLog = new this({
      action: data.action,
      actionType: data.actionType || "custom",
      performedBy: {
        userId: data.userId,
        name: data.userName,
        email: data.userEmail,
        role: data.userRole || "user",
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
      targetUser: data.targetUser || {},
      targetEntity: data.targetEntity || {},
      changes: data.changes || {},
      metadata: {
        requestId: data.requestId,
        sessionId: data.sessionId,
        deviceId: data.deviceId,
        location: data.location,
        duration: data.duration,
        status: data.status || "success",
        error: data.error,
        tags: data.tags || [],
        priority: data.priority || "medium",
      },
      securityLevel: data.securityLevel || "internal",
      compliance: data.compliance || {},
      timestamp: data.timestamp || new Date(),
    });

    await auditLog.save();
    return auditLog;
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw - audit logging failure shouldn't break the main flow
    return null;
  }
};

auditLogSchema.statics.getUserActivity = function (userId, options = {}) {
  const {
    limit = 50,
    offset = 0,
    startDate,
    endDate,
    actionTypes = [],
    status,
  } = options;

  const query = {
    $or: [{ "performedBy.userId": userId }, { "targetUser.userId": userId }],
  };

  // Date range
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  // Action types filter
  if (actionTypes.length > 0) {
    query.actionType = { $in: actionTypes };
  }

  // Status filter
  if (status) {
    query["metadata.status"] = status;
  }

  return this.find(query)
    .sort({ timestamp: -1 })
    .skip(offset)
    .limit(limit)
    .lean();
};

auditLogSchema.statics.getSecurityLogs = function (options = {}) {
  const { limit = 100, startDate, endDate, priority, ipAddress } = options;

  const query = {
    actionType: {
      $in: [
        "login_attempt",
        "failed_login",
        "brute_force_attempt",
        "suspicious_activity",
        "ip_blocked",
        "ip_unblocked",
        "admin_login",
      ],
    },
  };

  // Date range
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  // Priority filter
  if (priority) {
    query["metadata.priority"] = priority;
  }

  // IP filter
  if (ipAddress) {
    query["performedBy.ipAddress"] = ipAddress;
  }

  return this.find(query).sort({ timestamp: -1 }).limit(limit).lean();
};

auditLogSchema.statics.getStats = async function (period = "30d") {
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
    case "90d":
      startDate.setDate(now.getDate() - 90);
      break;
    default:
      startDate.setDate(now.getDate() - 30);
  }

  const stats = await this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: now },
      },
    },
    {
      $facet: {
        overview: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              successful: {
                $sum: {
                  $cond: [{ $eq: ["$metadata.status", "success"] }, 1, 0],
                },
              },
              failed: {
                $sum: {
                  $cond: [{ $eq: ["$metadata.status", "failed"] }, 1, 0],
                },
              },
              avgDuration: { $avg: "$metadata.duration" },
              uniqueUsers: { $addToSet: "$performedBy.userId" },
              uniqueIPs: { $addToSet: "$performedBy.ipAddress" },
            },
          },
        ],
        byActionType: [
          {
            $group: {
              _id: "$actionType",
              count: { $sum: 1 },
              avgDuration: { $avg: "$metadata.duration" },
              failed: {
                $sum: {
                  $cond: [{ $eq: ["$metadata.status", "failed"] }, 1, 0],
                },
              },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ],
        byUser: [
          {
            $match: { "performedBy.userId": { $exists: true, $ne: null } },
          },
          {
            $group: {
              _id: "$performedBy.userId",
              name: { $first: "$performedBy.name" },
              role: { $first: "$performedBy.role" },
              count: { $sum: 1 },
              lastActivity: { $max: "$timestamp" },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ],
        hourlyDistribution: [
          {
            $group: {
              _id: { $hour: "$timestamp" },
              count: { $sum: 1 },
              failed: {
                $sum: {
                  $cond: [{ $eq: ["$metadata.status", "failed"] }, 1, 0],
                },
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

// ⭐ COMPOUND INDEXES FOR PERFORMANCE
auditLogSchema.index({
  "performedBy.userId": 1,
  actionType: 1,
  timestamp: -1,
});

auditLogSchema.index({
  timestamp: -1,
  "metadata.priority": 1,
  "metadata.status": 1,
});

auditLogSchema.index({
  "targetEntity.type": 1,
  "targetEntity.id": 1,
  timestamp: -1,
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
