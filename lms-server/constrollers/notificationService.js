const Notification = require("../models/notificationSchema ");
const User = require("../models/loginUserModel");
const { sendEmail, sendSMS, sendPushNotification } = require("../utilis/email");

class NotificationService {
  // Create and deliver notification
  static async createAndDeliver(data) {
    try {
      // Create notification
      const notification = await Notification.createNotification(data);

      if (!notification) {
        throw new Error("Failed to create notification");
      }

      // Deliver through specified channels
      const deliveryPromises = [];

      if (data.channels.includes("email")) {
        deliveryPromises.push(
          sendEmail({
            to:
              data.email ||
              (await User.findById(data.userId).select("email")).email,
            subject: data.title,
            template: data.template || "notification",
            data: {
              ...data.data,
              title: data.title,
              message: data.message,
              actions: data.actions,
            },
          }),
        );
      }

      if (data.channels.includes("sms")) {
        deliveryPromises.push(
          sendSMS({
            to: data.phone,
            message: data.message,
          }),
        );
      }

      if (data.channels.includes("push")) {
        deliveryPromises.push(
          sendPushNotification({
            userId: data.userId,
            title: data.title,
            body: data.message,
            data: data.data,
          }),
        );
      }

      // Wait for all deliveries
      const results = await Promise.allSettled(deliveryPromises);

      // Update notification status
      const failedChannels = results
        .filter((result) => result.status === "rejected")
        .map((result, index) => data.channels[index]);

      if (failedChannels.length === 0) {
        notification.status = "delivered";
        notification.delivery.deliveredAt = new Date();
      } else if (failedChannels.length === data.channels.length) {
        notification.recordFailure("All delivery channels failed");
      } else {
        notification.status = "partial";
        notification.delivery.deliveredAt = new Date();
      }

      await notification.save();
      return notification;
    } catch (error) {
      console.error("Notification delivery failed:", error);

      // Try to update notification status if it exists
      if (notification) {
        await notification.recordFailure(error.message);
      }

      throw error;
    }
  }

  // Get user notifications with pagination
  static async getUserNotifications(userId, options = {}) {
    return await Notification.getUserNotifications(userId, options);
  }

  // Get unread count
  static async getUnreadCount(userId, category) {
    return await Notification.getUnreadCount(userId, category);
  }

  // Mark as read
  static async markAsRead(notificationId, userId) {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new Error("Notification not found");
    }

    if (notification.userId.toString() !== userId.toString()) {
      throw new Error("Unauthorized");
    }

    return await notification.markAsRead();
  }

  // Mark all as read
  static async markAllAsRead(userId, category) {
    return await Notification.markAllAsRead(userId, category);
  }

  // Archive notification
  static async archive(notificationId, userId) {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new Error("Notification not found");
    }

    if (notification.userId.toString() !== userId.toString()) {
      throw new Error("Unauthorized");
    }

    return await notification.archive();
  }

  // Get notification stats
  static async getStats(userId, period = "30d") {
    return await Notification.getNotificationStats(userId, period);
  }

  // Create notification for multiple users (bulk)
  static async notifyUsers(userIds, notificationData) {
    const notificationsData = userIds.map((userId) => ({
      userId,
      ...notificationData,
    }));

    return await Notification.createBulkNotifications(notificationsData);
  }

  // Cleanup expired notifications
  static async cleanup() {
    return await Notification.cleanupExpired();
  }

  // Send teacher approval notification
  static async sendTeacherApproval(userId, data) {
    return await this.createAndDeliver({
      userId,
      type: "teacher_application_approved",
      title: "🎉 Teacher Application Approved!",
      message: `Congratulations! Your teacher application has been approved. You can now create and manage courses.`,
      data: {
        approvalDate: data.approvalDate,
        commissionRate: data.commissionRate,
        nextSteps: data.nextSteps || [
          "Complete your teacher profile",
          "Set up payment information",
          "Create your first course",
        ],
        links: {
          dashboard: "/teacher/dashboard",
          profile: "/teacher/profile",
          createCourse: "/teacher/courses/create",
        },
      },
      priority: "high",
      category: "system",
      channels: ["in_app", "email"],
      actions: [
        {
          label: "Go to Dashboard",
          action: "redirect",
          url: "/teacher/dashboard",
          color: "primary",
        },
      ],
    });
  }

  // Send teacher rejection notification
  static async sendTeacherRejection(userId, data) {
    return await this.createAndDeliver({
      userId,
      type: "teacher_application_rejected",
      title: "Teacher Application Update",
      message: `Your teacher application has been reviewed.`,
      data: {
        status: "rejected",
        rejectionDate: data.rejectionDate,
        rejectionReason: data.rejectionReason,
        feedback: data.feedback,
        canReapply: data.canReapply,
        reapplyAfterDays: data.reapplyAfterDays,
        suggestions:
          data.suggestions ||
          "Please review our teacher requirements and apply again.",
        supportContact: data.supportContact,
      },
      priority: "high",
      category: "system",
      channels: ["in_app", "email"],
      actions: data.canReapply
        ? [
            {
              label: "View Requirements",
              action: "redirect",
              url: "/teacher/requirements",
              color: "secondary",
            },
          ]
        : [],
    });
  }
}

module.exports = NotificationService;
