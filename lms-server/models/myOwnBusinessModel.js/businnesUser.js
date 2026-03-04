const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // Basic Info
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  role: {
    type: String,
    enum: [
      "admin",
      "business_head",
      "finance_manager",
      "content_manager",
      "marketing_head",
      "instructor",
    ],
    default: "business_head",
  },

  // Business Access Level
  accessLevel: {
    type: String,
    enum: ["viewer", "editor", "admin"],
    default: "viewer",
  },

  // Profile
  profileImage: String,
  department: String,

  // Authentication
  password: String,
  lastLogin: Date,
  isActive: { type: Boolean, default: true },

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
