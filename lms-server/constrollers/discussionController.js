const ChatRoom = require("../models/discussionChatroom.js");
const DiscussionMassage = require("../models/discussionMassage.js");
const StandardSubject = require("../models/standardSubjectSchema.js");
const TeacherProfile = require("../models/teacherProfile.js");
const User = require("../models/loginUserModel.js");
const { uploadFileToCloudinary } = require("../config/cloudinary.js");
const fs = require("fs");
const mongoose = require("mongoose");
const { io, getReceiverSocketId, userSocketMap } = require("../server.js");

exports.createRoom = async (req, res) => {
  try {
    const {
      name,
      description,
      standard,
      subject,
      subjectId,
      settings,
      part,
      medium,
    } = req.body;
    const teacherId = req.user._id;
    const teacherName = req.user.name;

    // 1. Validate required fields
    if (!name || !standard || !subject || !subjectId || !medium) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, standard, subject, subjectId, or medium",
      });
    }

    // 2. Normalize inputs
    const normalizedName = name.trim();
    if (normalizedName.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Room name cannot be empty",
      });
    }

    const normalizedSubject = subject.trim().toLowerCase();
    const normalizedStandard = String(standard).trim();
    const normalizedMedium = medium.trim().toLowerCase();
    const normalizedPart = part ? part.trim() : "";

    // Validate standard is a valid number
    const standardNum = parseInt(standard, 10);
    if (isNaN(standardNum) || standardNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid standard format",
      });
    }

    // 3. Validate subjectId exists and matches
    const standardSubject = await StandardSubject.findById(subjectId);
    if (!standardSubject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // Normalize database values for comparison
    const dbStandard = parseInt(standardSubject.standard, 10);
    const dbSubject = standardSubject.subject.trim().toLowerCase();
    const dbMedium = standardSubject.medium?.trim().toLowerCase();

    // Validate that subjectId matches ALL THREE: standard + subject + medium
    if (
      dbStandard !== standardNum ||
      dbSubject !== normalizedSubject ||
      dbMedium !== normalizedMedium
    ) {
      return res.status(400).json({
        success: false,
        message: "Subject does not match the selected standard and medium",
      });
    }

    // 4. Validate Teacher Profile
    const teacherProfile = await TeacherProfile.findOne({
      user: teacherId,
    }).lean();

    if (!teacherProfile) {
      return res.status(403).json({
        success: false,
        message: "Teacher profile not found. Please complete your profile.",
      });
    }

    // 5. Check if teacher can teach this class (standard + subject + medium)
    let canTeachThisClass = false;

    // If teacherProfile has assignedClasses array
    if (teacherProfile.assignedClasses?.length > 0) {
      canTeachThisClass = teacherProfile.assignedClasses.some((cls) => {
        const clsStandard = parseInt(cls.standard, 10);
        const clsSubject = cls.subject?.trim().toLowerCase();
        const clsMedium = cls.medium?.trim().toLowerCase();
        return (
          clsStandard === dbStandard &&
          clsSubject === dbSubject &&
          clsMedium === normalizedMedium
        );
      });
    }

    // If no assignedClasses but teacher has medium field
    if (!canTeachThisClass && teacherProfile.medium) {
      // Handle both string and array formats for medium
      const teacherMediums = Array.isArray(teacherProfile.medium)
        ? teacherProfile.medium.map((m) => m?.trim().toLowerCase())
        : [teacherProfile.medium?.trim().toLowerCase()];

      // Check if teacher is authorized for this medium
      const canTeachMedium = teacherMediums.includes(normalizedMedium);

      if (!canTeachMedium) {
        return res.status(403).json({
          success: false,
          message: `You are not authorized to teach in ${medium} medium.`,
        });
      }

      // If medium is okay, check if teacher can teach this standard+subject
      // This might need additional logic based on your teacher profile structure
      canTeachThisClass = true; // or add specific validation
    }

    if (!canTeachThisClass) {
      return res.status(403).json({
        success: false,
        message: `You are not authorized to teach ${standardSubject.subject} for Standard ${standardSubject.standard} in ${medium} medium.`,
      });
    }

    // 6. Prevent Duplicate Room (Same Year, Same Medium)
    const academicYear = getCurrentAcademicYear();

    const existingRoom = await ChatRoom.findOne({
      teacherId,
      subjectId,
      name: normalizedName,
      standard: normalizedStandard,
      subject: normalizedSubject,
      medium: normalizedMedium, // ADDED: Include medium in duplicate check
      part: normalizedPart,
      academicYear,
      isActive: true,
    }).lean();

    if (existingRoom) {
      return res.status(409).json({
        success: false,
        message: `You already have a room named "${normalizedName}" for ${subject} (Standard ${standard}, ${medium} medium) in the current academic year.`,
      });
    }

    // 7. Find Eligible Students (IMPLEMENT THIS)
    // TODO: Implement student eligibility logic with medium consideration
    // const eligibleStudents = await StudentProfile.find({
    //   standard: normalizedStandard,
    //   medium: normalizedMedium,
    //   // Add other criteria as needed
    // });

    // 8. Generate Unique Room Code with better randomness
    let roomCode;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      roomCode = generateRoomCode();
      const exists = await ChatRoom.findOne({ roomCode }).lean();
      if (!exists) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate unique room code. Please try again.",
      });
    }

    // 9. Create Room with transaction for data consistency
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const chatRoom = new ChatRoom({
        name: normalizedName,
        description: description?.trim() || "",
        standard: normalizedStandard,
        subject: normalizedSubject,
        subjectId: subjectId,
        medium: normalizedMedium, // ADDED: Save medium in room
        part: normalizedPart,
        teacherId,
        teacherName,
        roomCode,
        academicYear,
        isActive: true,
        members: [
          {
            user: teacherId,
            name: teacherName,
            role: "subject-teacher",
            isAdmin: true,
            joinedAt: new Date(),
          },
        ],
        settings: {
          allowStudentMessages: settings?.allowStudentMessages ?? true,
          allowFileUpload: settings?.allowFileUpload ?? true,
          allowVoiceMessages: settings?.allowVoiceMessages ?? true,
          studentCanCreateTopics: settings?.studentCanCreateTopics ?? false,
          approvalRequired: settings?.approvalRequired ?? false,
        },
      });

      await chatRoom.save({ session });

      // TODO: Add eligible students to room here with medium check
      // if (eligibleStudents?.length > 0) {
      //   const studentMembers = eligibleStudents
      //     .filter(student => student.medium === normalizedMedium) // Filter by medium
      //     .map(student => ({
      //       user: student.userId,
      //       name: student.name,
      //       role: "student",
      //       isAdmin: false,
      //       joinedAt: new Date(),
      //     }));
      //   chatRoom.members.push(...studentMembers);
      //   await chatRoom.save({ session });
      // }

      await session.commitTransaction();
      await session.endSession();

      // 10. Respond to Client
      res.status(201).json({
        success: true,
        message: "Learning Hub created successfully",
        data: {
          roomId: chatRoom._id,
          name: chatRoom.name,
          subject: chatRoom.subject,
          standard: chatRoom.standard,
          medium: chatRoom.medium, // ADDED: Include medium in response
          part: chatRoom.part,
          roomCode: chatRoom.roomCode,
          academicYear: chatRoom.academicYear,
          teacherName: chatRoom.teacherName,
          settings: chatRoom.settings,
          createdAt: chatRoom.createdAt,
          memberCount: chatRoom.members.length,
        },
      });

      // 11. Notify Students (Async – Non-blocking)
      // Consider using a message queue or background job
      // notifyStudentsAboutNewRoom(chatRoom._id);
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Room Creation Error:", error);

    // Handle specific error types
    if (error.code === 11000) {
      // Extract which field caused the duplicate
      const duplicateField = Object.keys(error.keyPattern || {})[0];
      const messages = {
        roomCode: "Room code already exists. Please try again.",
        name: "A room with this name already exists for this academic year.",
        // Add other field-specific messages
      };

      return res.status(409).json({
        success: false,
        message:
          messages[duplicateField] || "A duplicate record already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create learning hub",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// exports.createRoom = async (req, res) => {
//   try {
//     const {
//       name,
//       description,
//       standard,
//       subject,
//       subjectId,
//       settings,
//       part,
//       medium,
//     } = req.body;
//     const teacherId = req.user._id;
//     const teacherName = req.user.name;

//     // 1. Validate required fields
//     if (!name || !standard || !subject || !subjectId || !medium) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Missing required fields: name, standard, subject, or subjectId",
//       });
//     }

//     // 2. Normalize inputs
//     const normalizedName = name.trim();
//     if (normalizedName.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Room name cannot be empty",
//       });
//     }

//     const normalizedSubject = subject.trim().toLowerCase();
//     const normalizedStandard = String(standard).trim();
//     const normalizedPart = part ? part.trim() : "";

//     // Validate standard is a valid number
//     const standardNum = parseInt(standard, 10);
//     if (isNaN(standardNum) || standardNum <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid standard format",
//       });
//     }

//     // 3. Validate subjectId exists and matches
//     const standardSubject = await StandardSubject.findById(subjectId);
//     if (!standardSubject) {
//       return res.status(404).json({
//         success: false,
//         message: "Subject not found",
//       });
//     }

//     // Normalize database values for comparison
//     const dbStandard = parseInt(standardSubject.standard, 10);
//     const dbSubject = standardSubject.subject.trim().toLowerCase();

//     if (dbStandard !== standardNum || dbSubject !== normalizedSubject) {
//       return res.status(400).json({
//         success: false,
//         message: "Subject does not match the selected standard",
//       });
//     }

//     // 4. Validate Teacher Profile
//     const teacherProfile = await TeacherProfile.findOne({
//       user: teacherId,
//     }).lean();

//     if (!teacherProfile) {
//       return res.status(403).json({
//         success: false,
//         message: "Teacher profile not found. Please complete your profile.",
//       });
//     }

//     // 5. Check if teacher can teach this class
//     const canTeachThisClass = teacherProfile.assignedClasses?.some((cls) => {
//       const clsStandard = parseInt(cls.standard, 10);
//       const clsSubject = cls.subject?.trim().toLowerCase();
//       return clsStandard === dbStandard && clsSubject === dbSubject;
//     });

//     if (!canTeachThisClass) {
//       return res.status(403).json({
//         success: false,
//         message: `You are not authorized to teach ${standardSubject.subject} for Standard ${standardSubject.standard}.`,
//       });
//     }

//     // 6. Prevent Duplicate Room (Same Year)
//     const academicYear = getCurrentAcademicYear();

//     const existingRoom = await ChatRoom.findOne({
//       teacherId,
//       subjectId,
//       name: normalizedName,
//       standard: normalizedStandard,
//       subject: normalizedSubject,
//       part: normalizedPart,
//       academicYear,
//       isActive: true,
//     }).lean();

//     if (existingRoom) {
//       return res.status(409).json({
//         success: false,
//         message: `You already have a room named "${normalizedName}" for ${subject} (Standard ${standard}) in the current academic year.`,
//       });
//     }

//     // 7. Find Eligible Students (IMPLEMENT THIS)
//     // TODO: Implement student eligibility logic
//     // const eligibleStudents = await StudentProfile.find({
//     //   standard: normalizedStandard,
//     //   // Add other criteria as needed
//     // });

//     // 8. Generate Unique Room Code with better randomness
//     let roomCode;
//     let isUnique = false;
//     let attempts = 0;
//     const maxAttempts = 10;

//     while (!isUnique && attempts < maxAttempts) {
//       roomCode = generateRoomCode();
//       const exists = await ChatRoom.findOne({ roomCode }).lean();
//       if (!exists) {
//         isUnique = true;
//       }
//       attempts++;
//     }

//     if (!isUnique) {
//       return res.status(500).json({
//         success: false,
//         message: "Failed to generate unique room code. Please try again.",
//       });
//     }

//     // 9. Create Room with transaction for data consistency
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//       const chatRoom = new ChatRoom({
//         name: normalizedName,
//         description: description?.trim() || "",
//         standard: normalizedStandard,
//         subject: normalizedSubject,
//         subjectId: subjectId,
//         part: normalizedPart,
//         teacherId,
//         teacherName,
//         roomCode,
//         academicYear,
//         isActive: true,
//         members: [
//           {
//             user: teacherId,
//             name: teacherName,
//             role: "subject-teacher",
//             isAdmin: true,
//             joinedAt: new Date(),
//           },
//         ],
//         settings: {
//           allowStudentMessages: settings?.allowStudentMessages ?? true,
//           allowFileUpload: settings?.allowFileUpload ?? true,
//           allowVoiceMessages: settings?.allowVoiceMessages ?? true,
//           studentCanCreateTopics: settings?.studentCanCreateTopics ?? false,
//           approvalRequired: settings?.approvalRequired ?? false,
//         },
//       });

//       await chatRoom.save({ session });

//       // TODO: Add eligible students to room here
//       // if (eligibleStudents?.length > 0) {
//       //   const studentMembers = eligibleStudents.map(student => ({
//       //     user: student.userId,
//       //     name: student.name,
//       //     role: "student",
//       //     isAdmin: false,
//       //     joinedAt: new Date(),
//       //   }));
//       //   chatRoom.members.push(...studentMembers);
//       //   await chatRoom.save({ session });
//       // }

//       await session.commitTransaction();
//       await session.endSession();

//       // 10. Respond to Client
//       res.status(201).json({
//         success: true,
//         message: "Learning Hub created successfully",
//         data: {
//           roomId: chatRoom._id,
//           name: chatRoom.name,
//           subject: chatRoom.subject,
//           standard: chatRoom.standard,
//           part: chatRoom.part,
//           roomCode: chatRoom.roomCode,
//           academicYear: chatRoom.academicYear,
//           teacherName: chatRoom.teacherName,
//           settings: chatRoom.settings,
//           createdAt: chatRoom.createdAt,
//           memberCount: chatRoom.members.length,
//         },
//       });

//       // 11. Notify Students (Async – Non-blocking)
//       // Consider using a message queue or background job
//       // notifyStudentsAboutNewRoom(chatRoom._id);
//     } catch (error) {
//       await session.abortTransaction();
//       await session.endSession();
//       throw error;
//     }
//   } catch (error) {
//     console.error("Room Creation Error:", error);

//     // Handle specific error types
//     if (error.code === 11000) {
//       // Extract which field caused the duplicate
//       const duplicateField = Object.keys(error.keyPattern || {})[0];
//       const messages = {
//         roomCode: "Room code already exists. Please try again.",
//         name: "A room with this name already exists for this academic year.",
//         // Add other field-specific messages
//       };

//       return res.status(409).json({
//         success: false,
//         message:
//           messages[duplicateField] || "A duplicate record already exists.",
//       });
//     }

//     if (error.name === "ValidationError") {
//       return res.status(400).json({
//         success: false,
//         message: "Validation failed",
//         errors: error.errors,
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Failed to create learning hub",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };
function generateRoomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function getCurrentAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = Jan

  // Academic year starts in June
  return month >= 5 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

exports.getMyRooms = async (req, res) => {
  try {
    const userId = req.user._id;
    const roles = Array.isArray(req.user.roles) ? req.user.roles : [];
    console.log("rrrrrrrrrrrrrrrrrrrrr", req.user);
    const { standard, part, subject, medium, subjectId } = req.query;

    const normalizedSubject = subject?.trim().toLowerCase();
    const normalizedStandard = standard ? String(standard) : undefined;

    let rooms = [];

    if (roles.includes("teacher")) {
      const filter = {
        isActive: true,
        teacherId: userId,
        ...(subjectId && { subjectId }),
        ...(normalizedStandard && { standard: normalizedStandard }),
        ...(normalizedSubject && { subject: normalizedSubject }),
        ...(medium && { medium }),
        ...(part && { part }),
      };

      rooms = await ChatRoom.find(filter)
        .populate("teacherId", "name avatar parishImage roles")
        .sort({ createdAt: -1 });
    } else if (roles.includes("student")) {
      const filter = {
        isActive: true,
        ...(normalizedStandard && { standard: normalizedStandard }),
        ...(part && { part }),
        ...(normalizedSubject && { subject: normalizedSubject }),
        ...(medium && { medium }),
        ...(subjectId && { subjectId }),
      };

      rooms = await ChatRoom.find(filter)
        .populate("teacherId", "name avatar parishImage roles")
        .sort({ createdAt: -1 });
    }

    // ✅ SEND RESPONSE (IMPORTANT)
    return res.json({ success: true, rooms });
  } catch (error) {
    console.error("Get My Rooms Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.join = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const room = await ChatRoom.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check if user is eligible
    if (req.user.role === "student") {
      const isEligible = room.eligibleStudents.some(
        (studentId) => studentId.toString() === userId.toString(),
      );

      if (!isEligible) {
        return res.status(403).json({
          message: "You are not eligible to join this room",
        });
      }
    }

    // Check if already member
    const isMember = room.members.some(
      (m) => m.user.toString() === userId.toString(),
    );

    if (!isMember) {
      room.members.push({
        user: userId,
        role: req.user.role === "teacher" ? "moderator" : "member",
      });

      await room.save();
    }

    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (page - 1) * limit;

    // 1️⃣ Fetch messages
    const messages = await DiscussionMassage.find({
      roomId,
      isDeleted: false,
    })
      .populate("senderId", "name avatar parishImage roles")
      .populate("replyTo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // 2️⃣ Mark as read (safe + guarded)
    const updatePromises = messages.map((msg) => {
      const readBy = Array.isArray(msg.readBy) ? msg.readBy : [];

      const hasRead = readBy.some(
        (read) =>
          read?.userId && read.userId.toString() === req.user._id.toString(),
      );

      if (!hasRead) {
        return DiscussionMassage.findByIdAndUpdate(msg._id, {
          $push: {
            readBy: {
              userId: req.user._id,
              readAt: new Date(),
            },
          },
        });
      }

      return Promise.resolve();
    });

    await Promise.all(updatePromises);

    // 3️⃣ Response
    res.status(200).json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      messages: messages.reverse(), // oldest → newest
    });
  } catch (error) {
    console.error("getMessages error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    const roles = req.user.roles || [];

    // 1️⃣ Find message
    const message = await DiscussionMassage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // 2️⃣ Permission check
    const isOwner = message.senderId.toString() === userId.toString();

    const isTeacher = roles.includes("teacher");
    const isAdmin = roles.includes("admin");

    if (!isOwner && !isTeacher && !isAdmin) {
      return res.status(403).json({
        message: "You do not have permission to delete this message",
      });
    }

    // 3️⃣ Soft delete
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.deletedBy = userId;

    await message.save();

    // 4️⃣ Find room (same as reaction)
    const room = await ChatRoom.findById(message.roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // 5️⃣ Emit socket event to EACH MEMBER (USER-BASED ✅)
    for (const member of room.members) {
      const receiverUserId = member.user.toString();
      const socketId = getReceiverSocketId(receiverUserId);

      if (socketId) {
        io.to(socketId).emit("message-deleted", {
          messageId: message._id.toString(),
          deletedBy: userId.toString(),
        });
      }
    }

    // 6️⃣ Response
    res.status(200).json({
      success: true,
      messageId: message._id,
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.pinMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await DiscussionMassage.findById(messageId);
    const room = await ChatRoom.findById(message.roomId);

    if (!message || !room) {
      return res.status(404).json({ message: "Message or room not found" });
    }

    // Only teachers/admins can pin
    if (req.user.role !== "teacher" && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only teachers can pin messages",
      });
    }

    message.isPinned = true;
    message.pinnedBy = userId;
    message.pinnedAt = new Date();

    room.pinnedMessages.push(messageId);
    await room.save();
    await message.save();

    // Broadcast pin
    const io = req.app.get("io");
    io.to(message.roomId.toString()).emit("message-pinned", {
      messageId: message._id,
      pinnedBy: userId,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.muteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roomId, duration } = req.body; // duration in minutes

    // Only teachers/admins can mute
    if (req.user.role !== "teacher" && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only teachers can mute users",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isMuted = true;
    user.mutedUntil = duration ? new Date(Date.now() + duration * 60000) : null;

    await user.save();

    // Broadcast mute
    const io = req.app.get("io");
    io.to(roomId).emit("user-muted", {
      userId,
      mutedBy: req.user._id,
      duration,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// exports.createMessage = async (req, res) => {
//   try {
//     const { roomId, text } = req.body;
//     const senderId = req.user._id;

//     console.log("roomId:", roomId);

//     // 1️⃣ Validate room
//     const room = await ChatRoom.findById(roomId);
//     if (!room) {
//       return res.status(404).json({ message: "Room not found" });
//     }

//     // 2️⃣ Upload media
//     console.log("req.files:", req.files);

//     const mediaFiles = req.files?.media || [];
//     const mediaUrls = [];

//     for (const file of mediaFiles) {
//       const uploaded = await uploadFileToCloudinary(file);
//       if (uploaded) mediaUrls.push(uploaded);

//       fs.unlink(file.path, () => {});
//     }

//     // 3️⃣ Create message (MATCH YOUR SCHEMA)
//     const message = await DiscussionMassage.create({
//       roomId,
//       senderId,

//       text,

//       media: mediaUrls,
//       messageType: mediaUrls.length ? "file" : "text",
//     });

//     // 4️⃣ Populate message ONCE
//     const populatedMessage = await DiscussionMassage.findById(message._id)
//       .populate("senderId", "_id name avatar role")
//       .lean();

//     // 5️⃣ Emit realtime message to ALL room members
//     for (const member of room.members) {
//       const receiverUserId = member.user.toString();
//       const socketId = getReceiverSocketId(receiverUserId);

//       console.log("sending to userId:", receiverUserId, "socketId:", socketId);

//       if (socketId) {
//         io.to(socketId).emit("newMessage", {
//           message: populatedMessage,
//         });
//       }
//     }

//     // 6️⃣ Send API response
//     res.status(201).json(populatedMessage);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.createMessage = async (req, res) => {
//   try {
//     const { roomId, text, replyTo } = req.body; // ✅ Get replyTo from request body
//     const senderId = req.user._id;

//     // 1️⃣ Validate room
//     const room = await ChatRoom.findById(roomId);
//     if (!room) {
//       return res.status(404).json({ message: "Room not found" });
//     }

//     // 2️⃣ Validate replyTo message (if provided)
//     let replyMessage = null;
//     if (replyTo) {
//       replyMessage = await DiscussionMassage.findById(replyTo);

//       if (!replyMessage) {
//         return res.status(400).json({ message: "Reply message not found" });
//       }

//       // Check if reply message belongs to the same room
//       if (replyMessage.roomId.toString() !== roomId) {
//         return res
//           .status(400)
//           .json({ message: "Cannot reply to message from another room" });
//       }
//     }

//     // 3️⃣ Upload media

//     const mediaFiles = req.files?.media || [];
//     const mediaUrls = [];

//     for (const file of mediaFiles) {
//       const uploaded = await uploadFileToCloudinary(file);
//       if (uploaded) mediaUrls.push(uploaded);

//       fs.unlink(file.path, () => {});
//     }

//     // 4️⃣ Create message with replyTo support
//     const message = await DiscussionMassage.create({
//       roomId,
//       senderId,
//       text,
//       media: mediaUrls,
//       messageType: mediaUrls.length ? "file" : "text",
//       replyTo: replyMessage ? replyMessage._id : null, // ✅ Add replyTo
//     });

//     // 5️⃣ Populate message with sender AND replyTo
//     const populatedMessage = await DiscussionMassage.findById(message._id)
//       .populate("senderId", "_id name avatar role")
//       .populate({
//         path: "replyTo",
//         select: "_id text media messageType senderId",
//         populate: {
//           path: "senderId",
//           select: "_id name avatar",
//         },
//       })
//       .lean();

//     // 6️⃣ Emit realtime message to ALL room members
//     for (const member of room.members) {
//       const receiverUserId = member.user.toString();
//       const socketId = getReceiverSocketId(receiverUserId);

//       if (socketId) {
//         io.to(socketId).emit("newMessage", {
//           message: populatedMessage,
//         });
//       }
//     }

//     // 7️⃣ Send API response
//     res.status(201).json(populatedMessage);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };
exports.createMessage = async (req, res) => {
  try {
    const { roomId, text, replyTo } = req.body; // ✅ Get replyTo from request body
    const senderId = req.user._id;

    // 1️⃣ Validate room
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // 2️⃣ Validate replyTo message (if provided)
    let replyMessage = null;
    if (replyTo) {
      replyMessage = await DiscussionMassage.findById(replyTo);

      if (!replyMessage) {
        return res.status(400).json({ message: "Reply message not found" });
      }

      // Check if reply message belongs to the same room
      if (replyMessage.roomId.toString() !== roomId) {
        return res
          .status(400)
          .json({ message: "Cannot reply to message from another room" });
      }
    }

    // 3️⃣ Upload media

    const mediaFiles = req.files?.media || [];
    const mediaUrls = [];

    for (const file of mediaFiles) {
      const uploaded = await uploadFileToCloudinary(file);
      if (uploaded) mediaUrls.push(uploaded);

      fs.unlink(file.path, () => {});
    }

    // 4️⃣ Create message with replyTo support
    const message = await DiscussionMassage.create({
      roomId,
      senderId,
      text,
      media: mediaUrls,
      messageType: mediaUrls.length ? "file" : "text",
      replyTo: replyMessage ? replyMessage._id : null, // ✅ Add replyTo
    });

    // 5️⃣ Populate message with sender AND replyTo

    const populatedMessage = await DiscussionMassage.findById(message._id)
      .populate("senderId", "_id name avatar parishImage role")
      .populate({
        path: "replyTo",
        populate: {
          path: "senderId",
          select: "name avatar parishImage roles",
        },
      })
      .lean();

    // 6️⃣ Emit realtime message to ALL room members
    for (const member of room.members) {
      const receiverUserId = member.user.toString();
      const socketId = getReceiverSocketId(receiverUserId);

      if (socketId) {
        io.to(socketId).emit("newMessage", {
          message: populatedMessage,
        });
      }
    }

    // 7️⃣ Send API response
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
exports.reactMessage = async (req, res) => {
  try {
    const { roomId, emoji } = req.body;
    const { messageId } = req.params;
    const userId = req.user._id;

    // 1️⃣ Validate room
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // 2️⃣ Find message
    const message = await DiscussionMassage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // 3️⃣ Validate message belongs to room
    if (message.roomId.toString() !== roomId) {
      return res.status(400).json({
        message: "Message does not belong to this room",
      });
    }

    // 4️⃣ Ensure reactions map exists
    if (!message.reactions) {
      message.reactions = {};
    }

    // 5️⃣ Remove user from all existing reactions
    for (const [key, users] of message.reactions.entries()) {
      message.reactions.set(
        key,
        users.filter((id) => id.toString() !== userId.toString()),
      );

      // Remove emoji key if empty
      if (message.reactions.get(key).length === 0) {
        message.reactions.delete(key);
      }
    }

    // 6️⃣ Add new reaction (if emoji is not null)
    if (emoji) {
      const users = message.reactions.get(emoji) || [];
      users.push(userId);
      message.reactions.set(emoji, users);
    }

    // 7️⃣ Save message
    await message.save();

    // 8️⃣ Populate for frontend
    const populatedMessage = await DiscussionMassage.findById(message._id)
      .populate("senderId", "_id name avatar parishImage role")
      .lean();

    // 9️⃣ Emit socket update to room members
    for (const member of room.members) {
      const receiverUserId = member.user.toString();
      const socketId = getReceiverSocketId(receiverUserId);

      if (socketId) {
        io.to(socketId).emit("messageReactionUpdated", {
          messageId,
          reactions: populatedMessage.reactions,
        });
      }
    }

    // 🔟 Send response
    res.status(200).json({
      messageId,
      reactions: populatedMessage.reactions,
    });
  } catch (error) {
    console.error("reactMessage error:", error);
    res.status(500).json({ message: error.message });
  }
};

// UnderstandingScore =
// (💡 + ✅ + 👍) − (❓ + ❌ + ⚠️)

// Teaching Effectiveness

// reactions received on teacher messages

// 🔥, 🙏, 💡 count

// average response time to doubts

// {
//   messageId,
//   reactions: {
//     "💡": 10,
//     "❓": 2,
//     "🔥": 6
//   }
// }
// If ❓ > 💡 → teacher should re-explain.

// 8️⃣ Next LEVEL (optional, later)

// When you’re ready:

// 📊 Student engagement dashboard

// 🧠 AI auto-summary per chapter

// ❓ Auto-detect confusing topics

// 🎯 Suggest revision content

// 🏆 Participation badges
