const mongoose = require("mongoose");
const chatRoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  standard: { type: String, required: true },
  subject: { type: String, required: true },
  medium: { type: String, required: true },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StandardSubject",
    required: true,
  },
  part: { type: String, default: "" },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // NEW: Add roomCode and academicYear
  roomCode: { type: String, unique: true },
  academicYear: { type: String, default: null },

  // Change isActive to status for consistency
  status: {
    type: String,
    enum: ["active", "inactive", "archived"],
    default: "active",
  },
  isActive: { type: Boolean, default: true }, // Keep for backward compatibility

  eligibleStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      joinedAt: { type: Date, default: Date.now },
      role: {
        type: String,
        enum: ["member", "subject-teacher"],
        default: "member",
      },
      isAdmin: { type: Boolean, default: false },
    },
  ],

  settings: {
    allowStudentMessages: { type: Boolean, default: true },
    allowFileUpload: { type: Boolean, default: true },
    allowVoiceMessages: { type: Boolean, default: true },
    studentCanCreateTopics: { type: Boolean, default: false },
    approvalRequired: { type: Boolean, default: false },
  },

  pinnedMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the unique index
chatRoomSchema.index(
  {
    teacherId: 1,
    name: 1,
    subject: 1,
    standard: 1,
    medium: 1,
    academicYear: 1,
  },
  { unique: true, name: "unique_room_per_teacher_per_year" },
);

module.exports = mongoose.model("ChatRoom", chatRoomSchema);
