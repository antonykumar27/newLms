const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String },

    media: [
      {
        url: String,
        type: {
          type: String,
          enum: ["image", "video", "pdf", "audio", "voice", "file"],
        },
        name: String,
        size: Number,
        duration: Number,
      },
    ],

    messageType: {
      type: String,
      enum: ["text", "file", "voice", "system"],
      default: "text",
    },

    // 🔁 Reply support
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiscussionMassage",
      default: null,
    },
    hasReplies: {
      type: Boolean,
      default: false,
    },
    // 😀 Reactions (WhatsApp style)
    reactions: {
      type: Map,
      of: [mongoose.Schema.Types.ObjectId], // emoji => [userIds]
      default: {},
    },

    // ⭐ Star/Favorite messages
    isStarred: { type: Boolean, default: false },
    starredBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Read receipts
    readBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        readAt: { type: Date },
      },
    ],

    // Moderation
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },

    isPinned: { type: Boolean, default: false },
    pinnedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    pinnedAt: { type: Date },

    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });

module.exports = mongoose.model("DiscussionMassage", messageSchema);
