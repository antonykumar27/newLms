const Course = require("../models/course");
const User = require("../models/loginUserModel");
const TeacherProfile = require("../models/teacherProfile");

const fs = require("fs");
const { uploadFileToCloudinary } = require("../config/cloudinaryCourse");
// ✅ Create course (Teacher only)
const mongoose = require("mongoose");

const Video = require("../models/videoModel");

// Apply to become teacher

const sendEmail = require("../utilis/email");

const applyAsTeacher = async (req, res) => {
  try {
    const userId = req.user.id;

    // Validate required fields
    const {
      bio,
      expertise,
      hourlyRate,
      assignedClasses,
      qualifications,
      experience,
      socialLinks,
      agreeToTerms,
      headline,
      teachingPhilosophy,
      languages,
      publicEmail,
      publicPhone,
      timezone,
      // NEW: Add teaching type and related fields
      teachingType = "school", // Default to school
      examCourses,
      skillCourses,
    } = req.body;

    if (!agreeToTerms || agreeToTerms === "false") {
      return res.status(400).json({
        message: "You must agree to the terms and conditions",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user already has a teacher profile
    const existingProfile = await TeacherProfile.findOne({ user: userId });

    if (existingProfile) {
      const currentStatus = existingProfile.application.status;

      if (currentStatus === "pending") {
        return res.status(400).json({
          success: false,
          message: "You already have a pending application",
        });
      }

      if (currentStatus === "approved") {
        return res.status(400).json({
          success: false,
          message: "You are already an approved teacher",
        });
      }

      if (currentStatus === "rejected") {
        const lastRejection = existingProfile.compliance?.previousRejections
          ? existingProfile.compliance.previousRejections[
              existingProfile.compliance.previousRejections.length - 1
            ]
          : null;

        if (lastRejection) {
          const rejectionDate = new Date(lastRejection.date);
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

          if (rejectionDate > thirtyDaysAgo) {
            const daysLeft = Math.ceil(
              (rejectionDate.getTime() +
                30 * 24 * 60 * 60 * 1000 -
                Date.now()) /
                (1000 * 60 * 60 * 24),
            );
            return res.status(400).json({
              success: false,
              message: `You can reapply in ${daysLeft} days`,
            });
          }
        }
      }
    }

    ///////////////////id//////////////////////////
    // Handle file uploads
    const resumeFiles = req.files?.resume || [];
    const resumeUrls = [];
    for (const file of resumeFiles) {
      const uploaded = await uploadFileToCloudinary(file);
      if (uploaded?.url) resumeUrls.push(uploaded);

      // Clean up temp file after upload
      fs.unlink(file.path, () => {});
    }
    const idProofFiles = req.files?.idProof || [];
    const idProofUrls = [];
    for (const file of idProofFiles) {
      const uploaded = await uploadFileToCloudinary(file);
      if (uploaded?.url) idProofUrls.push(uploaded);

      // Clean up temp file after upload
      fs.unlink(file.path, () => {});
    }

    ///////////////////////////////////stop/////////

    // Parse JSON data
    let parsedExpertise,
      parsedQualifications,
      parsedExperience,
      parsedSocialLinks,
      parsedLanguages,
      parsedAssignedClasses,
      parsedExamCourses,
      parsedSkillCourses;

    try {
      parsedExpertise =
        typeof expertise === "string" ? JSON.parse(expertise) : expertise;
      parsedQualifications =
        typeof qualifications === "string"
          ? JSON.parse(qualifications)
          : qualifications;
      parsedExperience =
        typeof experience === "string" ? JSON.parse(experience) : experience;
      parsedSocialLinks =
        typeof socialLinks === "string" ? JSON.parse(socialLinks) : socialLinks;
      parsedLanguages =
        typeof languages === "string" ? JSON.parse(languages) : languages;
      parsedAssignedClasses =
        typeof assignedClasses === "string"
          ? JSON.parse(assignedClasses)
          : assignedClasses;

      // NEW: Parse teaching type specific data
      parsedExamCourses =
        typeof examCourses === "string" ? JSON.parse(examCourses) : examCourses;
      parsedSkillCourses =
        typeof skillCourses === "string"
          ? JSON.parse(skillCourses)
          : skillCourses;
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return res.status(400).json({
        success: false,
        message: "Invalid data format. Please check your input.",
      });
    }

    // Validate teaching type
    const validTeachingTypes = ["school", "exam", "skill"];
    if (!validTeachingTypes.includes(teachingType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid teaching type. Must be 'school', 'exam', or 'skill'",
      });
    }

    // Validate required fields based on teaching type
    if (teachingType === "school") {
      if (
        !parsedAssignedClasses ||
        !Array.isArray(parsedAssignedClasses) ||
        parsedAssignedClasses.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Please add at least one class you want to teach",
        });
      }
    } else if (teachingType === "exam") {
      if (
        !parsedExamCourses ||
        !Array.isArray(parsedExamCourses) ||
        parsedExamCourses.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Please add at least one exam you want to teach",
        });
      }
    } else if (teachingType === "skill") {
      if (
        !parsedSkillCourses ||
        !Array.isArray(parsedSkillCourses) ||
        parsedSkillCourses.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Please add at least one skill you want to teach",
        });
      }
    }

    // Validate common required fields
    if (
      !bio ||
      !parsedExpertise ||
      !parsedQualifications ||
      !parsedExperience
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill all required fields: bio, expertise, qualifications, and experience",
      });
    }

    // Validate array structures
    if (!Array.isArray(parsedExpertise)) {
      return res.status(400).json({
        message: "Expertise must be an array",
      });
    }

    if (!Array.isArray(parsedQualifications)) {
      return res.status(400).json({
        message: "Qualifications must be an array",
      });
    }

    if (!Array.isArray(parsedExperience)) {
      return res.status(400).json({
        message: "Experience must be an array",
      });
    }

    // Prepare assignedClasses data (for school teachers)
    const normalizedAssignedClasses =
      teachingType === "school" &&
      parsedAssignedClasses &&
      Array.isArray(parsedAssignedClasses)
        ? parsedAssignedClasses.map((cls) => ({
            standard: cls.standard || cls,
            subject: cls.subject || "",
            medium: cls.medium || "english",
          }))
        : [];

    // Prepare examCourses data (for exam teachers)
    const normalizedExamCourses =
      teachingType === "exam" &&
      parsedExamCourses &&
      Array.isArray(parsedExamCourses)
        ? parsedExamCourses.map((exam) => ({
            examName: exam.examName || exam,
            subject: exam.subject || "",
            level: exam.level || "prelims",
          }))
        : [];

    // Prepare skillCourses data (for skill teachers)
    const normalizedSkillCourses =
      teachingType === "skill" &&
      parsedSkillCourses &&
      Array.isArray(parsedSkillCourses)
        ? parsedSkillCourses.map((skill) => ({
            skillName: skill.skillName || skill,
            category: skill.category || "other",
            level: skill.level || "beginner",
          }))
        : [];

    // Create/update teacher profile
    const teacherProfileData = {
      user: userId,
      isApplied: true,

      // NEW: Teaching type and specific data
      teachingType: teachingType,

      // ✅ Save teaching type specific data at ROOT level
      assignedClasses: normalizedAssignedClasses,
      examCourses: normalizedExamCourses,
      skillCourses: normalizedSkillCourses,

      application: {
        status: "pending",
        submittedAt: new Date(),
      },

      resume: resumeUrls,
      idProof: idProofUrls,

      profile: {
        headline: headline || `${user.name}'s Teaching Profile`,
        bio: bio.trim(),
        teachingPhilosophy: teachingPhilosophy || "",
        expertise: parsedExpertise.map((exp) => ({
          name: exp.name || exp,
          level: exp.level || "intermediate",
          years: exp.years || 0,
          verified: false,
        })),
        qualifications: parsedQualifications.map((qual) => ({
          degree: qual.degree || qual,
          institution: qual.institution || "",
          year: qual.year || new Date().getFullYear(),
          certificateUrl: qual.certificateUrl || "",
          verified: false,
        })),
        experience: parsedExperience.map((exp) => ({
          position: exp.position || exp,
          organization: exp.organization || "",
          description: exp.description || "",
          startDate: exp.startDate ? new Date(exp.startDate) : new Date(),
          endDate: exp.endDate ? new Date(exp.endDate) : null,
          currentlyWorking: exp.currentlyWorking || false,
          verified: false,
        })),
        languages: parsedLanguages
          ? parsedLanguages.map((lang) => ({
              language: lang.language || lang,
              proficiency: lang.proficiency || "conversational",
            }))
          : [],
      },
      social: parsedSocialLinks || {},
      contact: {
        publicEmail: publicEmail || user.email,
        publicPhone: publicPhone || "",
        timezone: timezone || "UTC",
        responseTime: 24,
      },
      payment: {
        hourlyRate: Number(hourlyRate) || 0,
        currency: "INR",
        commissionRate: 70,
      },
      stats: {
        joinedDate: new Date(),
        lastActivity: new Date(),
      },
      settings: {
        publicProfile: true,
        showEarnings: false,
        showContactInfo: false,
        allowReviews: true,
        allowStudentMessages: true,
        emailNotifications: {
          newEnrollment: true,
          newReview: true,
          withdrawal: true,
          courseUpdates: true,
          marketing: false,
        },
      },
      metadata: {
        lastProfileUpdate: new Date(),
        lastActivity: new Date(),
        profileCompletion: calculateProfileCompletion(
          teachingType,
          normalizedAssignedClasses,
          normalizedExamCourses,
          normalizedSkillCourses,
        ),
        signupSource: "web",
      },
    };

    let teacherProfile;
    if (existingProfile) {
      // For existing profile, update the teaching type specific data
      existingProfile.teachingType = teachingType;
      existingProfile.assignedClasses = normalizedAssignedClasses;
      existingProfile.examCourses = normalizedExamCourses;
      existingProfile.skillCourses = normalizedSkillCourses;

      Object.assign(existingProfile, teacherProfileData);
      existingProfile.application.status = "pending";
      existingProfile.application.submittedAt = new Date();
      teacherProfile = await existingProfile.save();
    } else {
      teacherProfile = await TeacherProfile.create(teacherProfileData);
    }

    // Send email notifications
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@learnhub.com";
      await sendEmail({
        email: adminEmail,
        subject: "New Teacher Application Received - LearnHub",
        html: generateAdminEmail(
          user,
          bio,
          parsedExpertise,
          hourlyRate,
          parsedQualifications,
          parsedExperience,
          teachingType, // Include teaching type in admin email
        ),
      });

      await sendEmail({
        email: user.email,
        subject: "Your Teacher Application is Submitted - LearnHub",
        html: generateUserEmail(user, teachingType),
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    // Response - Include teaching type and specific data in response
    res.status(200).json({
      success: true,
      message: "Teacher application submitted successfully",
      data: {
        applicationId: teacherProfile._id,
        applicationStatus: "pending",
        teachingType: teachingType,
        applicationDate: new Date(),
        reviewTimeline: "3-5 business days",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        profile: {
          headline: teacherProfile.profile.headline,
          bio: teacherProfile.profile.bio,
          teachingPhilosophy: teacherProfile.profile.teachingPhilosophy,

          expertise: teacherProfile.profile.expertise,
          qualifications: teacherProfile.profile.qualifications, // ✅ FIX
          experience: teacherProfile.profile.experience, // ✅ FIX
          languages: teacherProfile.profile.languages || [],

          hourlyRate: teacherProfile.payment.hourlyRate,

          assignedClasses: teacherProfile.assignedClasses || [],
          examCourses: teacherProfile.examCourses || [],
          skillCourses: teacherProfile.skillCourses || [],
        },
        social: teacherProfile.social, // optional but recommended
        resume: teacherProfile.resume,
        idProof: teacherProfile.idProof,
      },
    });
  } catch (error) {
    console.error("Teacher application error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit teacher application",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Helper function to calculate profile completion
function calculateProfileCompletion(
  teachingType,
  assignedClasses,
  examCourses,
  skillCourses,
) {
  let completion = 40; // Base completion

  // Add based on teaching type data
  switch (teachingType) {
    case "school":
      if (assignedClasses && assignedClasses.length > 0) completion += 20;
      break;
    case "exam":
      if (examCourses && examCourses.length > 0) completion += 20;
      break;
    case "skill":
      if (skillCourses && skillCourses.length > 0) completion += 20;
      break;
  }

  return Math.min(completion, 100);
}

// Add this searchTeachers function to your controller
exports.searchTeachers = async (req, res) => {
  try {
    const {
      teachingType,
      standard,
      subject,
      examName,
      skillName,
      category,
      level,
      status = "approved",
    } = req.query;

    let query = {
      isApplied: true,
      "application.status": status,
    };

    // Filter by teaching type
    if (teachingType) {
      query.teachingType = teachingType;
    }

    // School teacher search
    if (teachingType === "school" || !teachingType) {
      if (standard) {
        query["assignedClasses.standard"] = standard;
      }
      if (subject) {
        query["assignedClasses.subject"] = { $regex: subject, $options: "i" };
      }
    }

    // Exam teacher search
    if (teachingType === "exam") {
      if (examName) {
        query["examCourses.examName"] = { $regex: examName, $options: "i" };
      }
      if (subject) {
        query["examCourses.subject"] = { $regex: subject, $options: "i" };
      }
    }

    // Skill teacher search
    if (teachingType === "skill") {
      if (skillName) {
        query["skillCourses.skillName"] = { $regex: skillName, $options: "i" };
      }
      if (category) {
        query["skillCourses.category"] = category;
      }
    }

    if (level) {
      const levelField =
        teachingType === "skill"
          ? "skillCourses.level"
          : teachingType === "exam"
            ? "examCourses.level"
            : null;
      if (levelField) {
        query[levelField] = level;
      }
    }

    const teachers = await TeacherProfile.find(query)
      .populate("user", "name email profilePicture")
      .sort({ "application.submittedAt": -1 });

    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    console.error("Search teachers error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching teachers",
      error: error.message,
    });
  }
};

// Add this function to update email templates

// const applyAsTeacher = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     // Validate required fields
//     const {
//       bio,
//       expertise,
//       hourlyRate,
//       assignedClasses,
//       qualifications,
//       experience,
//       socialLinks,
//       agreeToTerms,
//       headline,
//       teachingPhilosophy,
//       languages,
//       publicEmail,
//       publicPhone,
//       timezone,
//     } = req.body;

//     if (!agreeToTerms || agreeToTerms === "false") {
//       return res.status(400).json({
//         message: "You must agree to the terms and conditions",
//       });
//     }

//     // Check if user exists
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Check if user already has a teacher profile
//     const existingProfile = await TeacherProfile.findOne({ user: userId });

//     if (existingProfile) {
//       const currentStatus = existingProfile.application.status;

//       if (currentStatus === "pending") {
//         return res.status(400).json({
//           success: false,
//           message: "You already have a pending application",
//         });
//       }

//       if (currentStatus === "approved") {
//         return res.status(400).json({
//           success: false,
//           message: "You are already an approved teacher",
//         });
//       }

//       if (currentStatus === "rejected") {
//         const lastRejection = existingProfile.compliance.previousRejections
//           ? existingProfile.compliance.previousRejections[
//               existingProfile.compliance.previousRejections.length - 1
//             ]
//           : null;

//         if (lastRejection) {
//           const rejectionDate = new Date(lastRejection.date);
//           const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

//           if (rejectionDate > thirtyDaysAgo) {
//             const daysLeft = Math.ceil(
//               (rejectionDate.getTime() +
//                 30 * 24 * 60 * 60 * 1000 -
//                 Date.now()) /
//                 (1000 * 60 * 60 * 24),
//             );
//             return res.status(400).json({
//               success: false,
//               message: `You can reapply in ${daysLeft} days`,
//             });
//           }
//         }
//       }
//     }

//     ///////////////////id//////////////////////////
//     // Handle file uploads
//     const resumeFiles = req.files?.resume || [];
//     const resumeUrls = [];
//     for (const file of resumeFiles) {
//       const uploaded = await uploadFileToCloudinary(file);
//       if (uploaded?.url) resumeUrls.push(uploaded);

//       // Clean up temp file after upload
//       fs.unlink(file.path, () => {});
//     }
//     const idProofFiles = req.files?.idProof || [];
//     const idProofUrls = [];
//     for (const file of idProofFiles) {
//       const uploaded = await uploadFileToCloudinary(file);
//       if (uploaded?.url) idProofUrls.push(uploaded);

//       // Clean up temp file after upload
//       fs.unlink(file.path, () => {});
//     }
//     ///////////////////////////////////stop/////////

//     // Parse JSON data
//     let parsedExpertise,
//       parsedQualifications,
//       parsedExperience,
//       parsedSocialLinks,
//       parsedLanguages,
//       parsedAssignedClasses;

//     try {
//       parsedExpertise =
//         typeof expertise === "string" ? JSON.parse(expertise) : expertise;
//       parsedQualifications =
//         typeof qualifications === "string"
//           ? JSON.parse(qualifications)
//           : qualifications;
//       parsedExperience =
//         typeof experience === "string" ? JSON.parse(experience) : experience;
//       parsedSocialLinks =
//         typeof socialLinks === "string" ? JSON.parse(socialLinks) : socialLinks;
//       parsedLanguages =
//         typeof languages === "string" ? JSON.parse(languages) : languages;
//       parsedAssignedClasses =
//         typeof assignedClasses === "string"
//           ? JSON.parse(assignedClasses)
//           : assignedClasses;
//     } catch (parseError) {
//       console.error("JSON parsing error:", parseError);
//       return res.status(400).json({
//         success: false,
//         message: "Invalid data format. Please check your input.",
//       });
//     }

//     // Debug log to see what's being parsed
//     console.log("Parsed assignedClasses:", parsedAssignedClasses);
//     console.log("Type:", typeof parsedAssignedClasses);

//     // Validate required fields
//     if (
//       !bio ||
//       !parsedExpertise ||
//       !parsedQualifications ||
//       !parsedExperience
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Please fill all required fields: bio, expertise, qualifications, and experience",
//       });
//     }

//     // Validate array structures
//     if (!Array.isArray(parsedExpertise)) {
//       return res.status(400).json({
//         message: "Expertise must be an array",
//       });
//     }

//     if (!Array.isArray(parsedQualifications)) {
//       return res.status(400).json({
//         message: "Qualifications must be an array",
//       });
//     }

//     if (!Array.isArray(parsedExperience)) {
//       return res.status(400).json({
//         message: "Experience must be an array",
//       });
//     }

//     // Validate assignedClasses if provided
//     if (parsedAssignedClasses && !Array.isArray(parsedAssignedClasses)) {
//       return res.status(400).json({
//         message: "Assigned classes must be an array",
//       });
//     }

//     // Prepare assignedClasses data
//     const normalizedAssignedClasses =
//       parsedAssignedClasses && Array.isArray(parsedAssignedClasses)
//         ? parsedAssignedClasses.map((cls) => ({
//             standard: cls.standard || cls,
//             subject: cls.subject || "",
//           }))
//         : [];

//     console.log("Normalized assignedClasses:", normalizedAssignedClasses);

//     // Create/update teacher profile - FIXED: Save assignedClasses at ROOT level
//     const teacherProfileData = {
//       user: userId,
//       isApplied: true,

//       // ✅ CRITICAL FIX: Save assignedClasses at ROOT level (matching your schema)
//       assignedClasses: normalizedAssignedClasses,

//       application: {
//         status: "pending",
//         submittedAt: new Date(),
//       },

//       resume: resumeUrls,
//       idProof: idProofUrls,

//       profile: {
//         headline: headline || `${user.name}'s Teaching Profile`,
//         bio: bio.trim(),
//         teachingPhilosophy: teachingPhilosophy || "",
//         expertise: parsedExpertise.map((exp) => ({
//           name: exp.name || exp,
//           level: exp.level || "intermediate",
//           years: exp.years || 0,
//           verified: false,
//         })),
//         qualifications: parsedQualifications.map((qual) => ({
//           degree: qual.degree || qual,
//           institution: qual.institution || "",
//           year: qual.year || new Date().getFullYear(),
//           certificateUrl: qual.certificateUrl || "",
//           verified: false,
//         })),
//         experience: parsedExperience.map((exp) => ({
//           position: exp.position || exp,
//           organization: exp.organization || "",
//           description: exp.description || "",
//           startDate: exp.startDate ? new Date(exp.startDate) : new Date(),
//           endDate: exp.endDate ? new Date(exp.endDate) : null,
//           currentlyWorking: exp.currentlyWorking || false,
//           verified: false,
//         })),
//         // ❌ Remove this line if you don't want duplication
//         // assignedClasses: normalizedAssignedClasses,
//         languages: parsedLanguages
//           ? parsedLanguages.map((lang) => ({
//               language: lang.language || lang,
//               proficiency: lang.proficiency || "conversational",
//             }))
//           : [],
//       },
//       social: parsedSocialLinks || {},
//       contact: {
//         publicEmail: publicEmail || user.email,
//         publicPhone: publicPhone || "",
//         timezone: timezone || "UTC",
//         responseTime: 24,
//       },
//       payment: {
//         hourlyRate: Number(hourlyRate) || 0,
//         currency: "INR",
//         commissionRate: 70,
//       },
//       stats: {
//         joinedDate: new Date(),
//         lastActivity: new Date(),
//       },
//       settings: {
//         publicProfile: true,
//         showEarnings: false,
//         showContactInfo: false,
//         allowReviews: true,
//         allowStudentMessages: true,
//         emailNotifications: {
//           newEnrollment: true,
//           newReview: true,
//           withdrawal: true,
//           courseUpdates: true,
//           marketing: false,
//         },
//       },
//       metadata: {
//         lastProfileUpdate: new Date(),
//         lastActivity: new Date(),
//         profileCompletion: 40,
//         signupSource: "web",
//       },
//     };

//     let teacherProfile;
//     if (existingProfile) {
//       // For existing profile, update the root-level assignedClasses
//       existingProfile.assignedClasses = normalizedAssignedClasses;
//       Object.assign(existingProfile, teacherProfileData);
//       existingProfile.application.status = "pending";
//       existingProfile.application.submittedAt = new Date();
//       teacherProfile = await existingProfile.save();
//     } else {
//       teacherProfile = await TeacherProfile.create(teacherProfileData);
//     }

//     // Debug log to verify saved data
//     console.log("Saved teacher profile:", {
//       assignedClasses: teacherProfile.assignedClasses,
//       profileAssignedClasses: teacherProfile.profile?.assignedClasses,
//     });

//     // Send email notifications
//     try {
//       const adminEmail = process.env.ADMIN_EMAIL || "admin@learnhub.com";
//       await sendEmail({
//         email: adminEmail,
//         subject: "New Teacher Application Received - LearnHub",
//         html: generateAdminEmail(
//           user,
//           bio,
//           parsedExpertise,
//           hourlyRate,
//           parsedQualifications,
//           parsedExperience,
//         ),
//       });

//       await sendEmail({
//         email: user.email,
//         subject: "Your Teacher Application is Submitted - LearnHub",
//         html: generateUserEmail(user),
//       });
//     } catch (emailError) {
//       console.error("Email sending failed:", emailError);
//     }

//     // Response - Include assignedClasses in response
//     res.status(200).json({
//       success: true,
//       message: "Teacher application submitted successfully",
//       data: {
//         applicationId: teacherProfile._id,
//         applicationStatus: "pending",
//         applicationDate: new Date(),
//         reviewTimeline: "3-5 business days",
//         user: {
//           id: user._id,
//           name: user.name,
//           email: user.email,
//         },
//         profile: {
//           bio: teacherProfile.profile.bio,
//           expertise: teacherProfile.profile.expertise,
//           hourlyRate: teacherProfile.payment.hourlyRate,
//           // ✅ Include assignedClasses in response
//           assignedClasses: teacherProfile.assignedClasses || [],
//         },
//         resume: teacherProfile.resume,
//         idProof: teacherProfile.idProof,
//       },
//     });
//   } catch (error) {
//     console.error("Teacher application error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to submit teacher application",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// Helper functions for email templates

const generateAdminEmail = (
  user,
  bio,
  expertise,
  hourlyRate,
  qualifications,
  experience,
) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">New Teacher Application</h2>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
        <h3>Applicant Details</h3>
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Applied On:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      <div style="background-color: #fff8e1; padding: 15px; border-radius: 8px; margin-top: 15px;">
        <h3 style="color: #ff9800;">Application Summary</h3>
        <p><strong>Bio:</strong> ${bio.substring(0, 150)}${bio.length > 150 ? "..." : ""}</p>
        <p><strong>Expertise:</strong> ${expertise.map((e) => e.name || e).join(", ")}</p>
        <p><strong>Hourly Rate:</strong> ₹${Number(hourlyRate) || 0}</p>
        <p><strong>Qualifications:</strong> ${qualifications.length} entries</p>
        <p><strong>Experience:</strong> ${experience.length} entries</p>
      </div>
    </div>
  `;
};

const generateUserEmail = (user) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center;">
        <h1 style="color: #f97316;">Application Submitted Successfully!</h1>
        <p>Hello ${user.name}, your teacher application has been received.</p>
      </div>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
        <h3>Application Details</h3>
        <p><strong>Application ID:</strong> TCH-${user._id.toString().slice(-8).toUpperCase()}</p>
        <p><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Status:</strong> <span style="color: #f59e0b; font-weight: bold;">Pending Review</span></p>
        <p><strong>Review Timeline:</strong> 3-5 business days</p>
      </div>
    </div>
  `;
};

// Get all teacher's courses
// const getTeacherCourses = async (req, res) => {
//   try {
//     const { category, search, page = 1, limit = 10, status } = req.query;
//     const userId = req.user.id;

//     let query = { instructor: userId };

//     if (category && category !== "all") query.category = category;
//     if (status && status !== "all") query.status = status;

//     if (search) {
//       query.$or = [
//         { title: { $regex: search, $options: "i" } },
//         { description: { $regex: search, $options: "i" } },
//         { category: { $regex: search, $options: "i" } },
//       ];
//     }

//     const courses = await Course.find(query)
//       .populate("instructor", "name email")
//       .limit(Number(limit))
//       .skip((page - 1) * limit)
//       .sort({ updatedAt: -1 });

//     const total = await Course.countDocuments(query);

//     res.json({
//       courses,
//       totalPages: Math.ceil(total / limit),
//       currentPage: Number(page),
//       total,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
const getTeacherCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRoles = req.user.roles || [];
    const { category, search, page = 1, limit = 10, status } = req.query;

    // ========================
    // TEACHER SPECIFIC (Your old logic)
    // ========================
    if (userRoles.includes("teacher")) {
      let query = { instructor: userId };

      if (category && category !== "all") query.category = category;
      if (status && status !== "all") query.status = status;

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ];
      }

      const courses = await Course.find(query)
        .populate("instructor", "name email")
        .limit(Number(limit))
        .skip((page - 1) * limit)
        .sort({ updatedAt: -1 });

      const total = await Course.countDocuments(query);

      return res.json({
        courses,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total,
      });

      // ========================
      // ADMIN VIEW
      // ========================
    } else if (
      userRoles.includes("admin") ||
      userRoles.includes("super-admin")
    ) {
      let query = {};

      if (category && category !== "all") query.category = category;
      if (status && status !== "all") query.status = status;

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
          { "instructor.name": { $regex: search, $options: "i" } },
        ];
      }

      const courses = await Course.find(query)
        .populate("instructor", "name email avatar isVerified status")
        .populate("videos", "title duration status")
        .limit(Number(limit))
        .skip((page - 1) * limit)
        .sort({ updatedAt: -1 });

      const total = await Course.countDocuments(query);

      return res.json({
        courses,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total,
        view: "admin",
      });

      // ========================
      // STUDENT VIEW
      // ========================
    } else if (userRoles.includes("student")) {
      const user = await User.findById(userId);
      const enrolledCourseIds = user.enrolledCourses || [];

      let query = {
        status: "published",
        approvalStatus: "approved",
      };

      if (status === "enrolled") {
        query._id = { $in: enrolledCourseIds };
      } else if (status === "available") {
        query._id = { $nin: enrolledCourseIds };
      }

      if (category && category !== "all") query.category = category;

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ];
      }

      const courses = await Course.find(query)
        .select(
          "title description thumbnail instructor price discountPrice rating totalStudents totalDuration level category tags isFree enrollmentType",
        )
        .populate("instructor", "name avatar rating totalStudents")
        .populate({
          path: "videos",
          select: "title duration isPreview",
          match: { isPreview: true },
        })
        .limit(Number(limit))
        .skip((page - 1) * limit)
        .sort({ updatedAt: -1 });

      const total = await Course.countDocuments(query);

      return res.json({
        courses,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total,
        view: "student",
      });

      // ========================
      // DEFAULT/GUEST VIEW
      // ========================
    } else {
      let query = {
        status: "published",
        approvalStatus: "approved",
        isFree: true,
      };

      if (category && category !== "all") query.category = category;

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ];
      }

      const courses = await Course.find(query)
        .select(
          "title description thumbnail instructor price level category tags shortDescription totalDuration totalLectures",
        )
        .populate("instructor", "name avatar")
        .limit(Number(limit))
        .skip((page - 1) * limit)
        .sort({ updatedAt: -1 });

      const total = await Course.countDocuments(query);

      return res.json({
        courses,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total,
        view: "guest",
      });
    }
  } catch (error) {
    console.error("Error getting courses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get courses",
      error: error.message,
    });
  }
};
// Helper function for role permissions

const getTeacherCoursesById = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;

    const course = await Course.findOne({
      _id: courseId,
      instructor: userId,
    }).populate("instructor", "name email");

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or unauthorized" });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get teacher course stats
const getTeacherCourseStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const courses = await Course.find({ instructor: userId });

    const stats = {
      total: courses.length,
      published: 0,
      draft: 0,
      pending: 0,
      archived: 0,
      totalEnrollments: 0,
      totalRevenue: 0,
      totalLectures: 0,
    };

    courses.forEach((course) => {
      // Status counts
      if (course.status === "published") stats.published++;
      if (course.status === "draft") stats.draft++;
      if (course.status === "pending") stats.pending++;
      if (course.status === "archived") stats.archived++;

      // Enrollments and revenue
      const enrollments = course.students?.length || 0;
      stats.totalEnrollments += enrollments;
      stats.totalRevenue += (course.price || 0) * enrollments;

      // Total lectures
      if (course.sections) {
        course.sections.forEach((section) => {
          stats.totalLectures += section.lectures?.length || 0;
        });
      }
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================
// HELPER FUNCTIONS
// ========================
const safeParse = (value, defaultValue = []) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
};

const validatePricing = (price, discountPrice) => {
  const priceNum = Number(price);
  const discountNum = Number(discountPrice) || 0;

  if (priceNum < 0 || discountNum < 0) {
    throw new Error("Price and discount must be positive values");
  }

  if (discountNum > priceNum) {
    throw new Error("Discount price cannot be greater than regular price");
  }

  return { price: priceNum, discountPrice: discountNum };
};

const validateCourseData = (title, sections) => {
  if (!title || title.trim().length < 5) {
    throw new Error("Course title must be at least 5 characters");
  }

  if (!sections || sections.length === 0) {
    throw new Error("Course must have at least one section");
  }

  // Validate each section
  for (const [index, section] of sections.entries()) {
    if (!section.title || section.title.trim().length < 3) {
      throw new Error(`Section ${index + 1} must have a valid title`);
    }

    if (!section.videos || section.videos.length === 0) {
      throw new Error(
        `Section "${section.title}" must have at least one video`,
      );
    }

    // Validate videos in section
    for (const [videoIndex, video] of section.videos.entries()) {
      if (!video.title || video.title.trim().length < 3) {
        throw new Error(
          `Video ${videoIndex + 1} in section "${
            section.title
          }" must have a title`,
        );
      }

      if (!video.videoUrl && !video.videoFile) {
        throw new Error(`Video "${video.title}" must have a URL or file`);
      }

      if (video.duration && (video.duration < 0 || video.duration > 36000)) {
        throw new Error(
          `Video "${video.title}" duration must be between 0 and 10 hours`,
        );
      }
    }
  }
};

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 100);
};

// ========================
// MAIN CONTROLLER
// ========================
const createTeacherCourse = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let createdVideoIds = [];
  let tempFilesToDelete = [];

  try {
    // ========================
    // 1. AUTHORIZATION & VALIDATION
    // ========================
    const instructorId = req.user.id;

    // Role validation
    if (req.user.role !== "teacher" && req.user.role !== "admin") {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "Only teachers or admins can create courses",
        code: "FORBIDDEN_ROLE",
      });
    }

    // Teacher status validation
    const teacher = await User.findById(instructorId).session(session);
    if (!teacher) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    if (!teacher.isVerified) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "Teacher account not verified",
        code: "TEACHER_NOT_VERIFIED",
      });
    }

    if (teacher.status === "suspended") {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "Teacher account is suspended",
        code: "TEACHER_SUSPENDED",
      });
    }

    // ========================
    // 2. REQUEST VALIDATION
    // ========================
    const {
      title,
      description,
      shortDescription,
      category,
      subcategory,
      language = "en",
      level = "beginner",
      thumbnail,
      promoVideo,
      price = 0,
      discountPrice = 0,
      currency = "USD",
      enrollmentType = "paid",
      sections,
      prerequisites,
      targetAudience,
      learningOutcomes,
      tags,
      keywords,
      isCertified = false,
      certificateTemplate,
      featured = false,
      trending = false,
      metaTitle,
      metaDescription,
      allowReviews = true,
      accessType = "lifetime",
      difficulty,
      certificateIssuer,
      requirements,
      welcomeMessage,
      completionMessage,
    } = req.body;

    // Validate required fields
    if (!title || !category || !description) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Title, category, and description are required",
        code: "MISSING_REQUIRED_FIELDS",
      });
    }

    // Parse array fields
    const parsedSections = safeParse(sections, []);
    const parsedPrerequisites = safeParse(prerequisites, []);
    const parsedTargetAudience = safeParse(targetAudience, []);
    const parsedLearningOutcomes = safeParse(learningOutcomes, []);
    const parsedRequirements = safeParse(requirements, []);
    // Learning Context

    // Validate course data
    try {
      validateCourseData(title, parsedSections);
    } catch (validationError) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: validationError.message,
        code: "COURSE_VALIDATION_FAILED",
      });
    }

    // Validate pricing
    try {
      var { price: validatedPrice, discountPrice: validatedDiscountPrice } =
        validatePricing(price, discountPrice);
    } catch (pricingError) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: pricingError.message,
        code: "INVALID_PRICING",
      });
    }

    // ========================
    // 3. FILE HANDLING (Separation of Concerns)
    // ========================
    let uploadedThumbnail = thumbnail;
    let uploadedPromoVideo = promoVideo;
    let uploadedMedia = [];

    // Handle file uploads if present
    if (req.files) {
      // Handle thumbnail
      if (req.files.thumbnail) {
        const thumbnailFile = req.files.thumbnail[0];
        try {
          const uploaded = await uploadFileToCloudinary(thumbnailFile);
          uploadedThumbnail = uploaded.url;
          tempFilesToDelete.push(thumbnailFile.path);
        } catch (uploadError) {
          console.error("Thumbnail upload failed:", uploadError);
        }
      }

      // Handle promo video
      if (req.files.promoVideo) {
        const promoVideoFile = req.files.promoVideo[0];
        try {
          const uploaded = await uploadFileToCloudinary(promoVideoFile);
          uploadedPromoVideo = uploaded.url;
          tempFilesToDelete.push(promoVideoFile.path);
        } catch (uploadError) {
          console.error("Promo video upload failed:", uploadError);
        }
      }

      // Handle additional media
      if (req.files.media) {
        for (const file of req.files.media) {
          try {
            const uploaded = await uploadFileToCloudinary(file);
            uploadedMedia.push(uploaded.url);
            tempFilesToDelete.push(file.path);
          } catch (uploadError) {
            console.error("Media upload failed:", uploadError);
          }
        }
      }
    }

    // ========================
    // 4. CREATE VIDEOS WITH TRANSACTION
    // ========================
    let totalCourseDuration = 0;
    let totalCourseLectures = 0;
    const updatedSections = [];

    // Generate unique section IDs
    const sectionIds = parsedSections.map(() => new mongoose.Types.ObjectId());

    // Process sections and videos
    for (let i = 0; i < parsedSections.length; i++) {
      const section = parsedSections[i];
      const sectionId = sectionIds[i];
      const sectionVideos = [];
      let sectionDuration = 0;

      // Process videos in this section
      for (let j = 0; j < (section.videos || []).length; j++) {
        const videoData = section.videos[j];

        // Handle video file upload if provided
        let videoUrl = videoData.videoUrl;
        if (!videoUrl && req.files && req.files[`video-${i}-${j}`]) {
          const videoFile = req.files[`video-${i}-${j}`][0];
          try {
            const uploaded = await uploadFileToCloudinary(videoFile);
            videoUrl = uploaded.url;
            tempFilesToDelete.push(videoFile.path);
          } catch (uploadError) {
            console.error("Video upload failed:", uploadError);
            throw new Error(`Failed to upload video: ${videoData.title}`);
          }
        }

        if (!videoUrl) {
          throw new Error(`Video URL required for: ${videoData.title}`);
        }

        // Create Video document (IN TRANSACTION)
        const newVideo = new Video({
          title: videoData.title.trim(),
          description: videoData.description?.trim() || "",
          courseId: null, // Will be set after course creation
          sectionId: sectionId,
          duration: Math.max(0, Number(videoData.duration) || 0),
          videoUrl: videoUrl,
          thumbnail: videoData.thumbnail || "",
          order: j,
          isPreview: videoData.isPreview === true,
          isFree: videoData.isFree === true,
          status: "draft", // ✅ All entities start as draft
          createdBy: instructorId,
          fileSize: videoData.fileSize || 0,
          resolution: videoData.resolution || "720p",
          encoding: videoData.encoding || "h264",
          subtitles: videoData.subtitles || [],
          resources: videoData.resources || [],
          notes: videoData.notes || "",
          isDownloadable: videoData.isDownloadable || false,
          requiresCompletion: videoData.requiresCompletion || false,
          metaTitle: videoData.metaTitle,
          metaDescription: videoData.metaDescription,
        });

        await newVideo.save({ session });
        createdVideoIds.push(newVideo._id);

        // Add to section videos
        sectionVideos.push({
          videoId: newVideo._id,
          title: newVideo.title,
          duration: newVideo.duration,
          isPreview: newVideo.isPreview,
          isFree: newVideo.isFree,
          order: newVideo.order,
          thumbnail: newVideo.thumbnail,
        });

        // Update counters
        totalCourseDuration += newVideo.duration;
        totalCourseLectures += 1;
        sectionDuration += newVideo.duration;
      }

      // Store processed section
      updatedSections.push({
        _id: sectionId,
        title: section.title.trim(),
        description: section.description?.trim() || "",
        order: i,
        videos: sectionVideos,
        videoCount: sectionVideos.length,
        duration: sectionDuration,
        isPublished: false,
        isLocked: section.isLocked || false,
        requiresCompletion: section.requiresCompletion || false,
        previewVideo: section.previewVideo || null,
      });
    }

    // ========================
    // 5. TAGS & KEYWORDS
    // ========================
    const tagArray = Array.isArray(tags)
      ? tags
      : typeof tags === "string" && tags.trim()
        ? tags
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter((t) => t.length > 0)
        : [];

    const keywordArray = Array.isArray(keywords)
      ? keywords
      : typeof keywords === "string" && keywords.trim()
        ? keywords
            .split(",")
            .map((k) => k.trim())
            .filter((k) => k.length > 0)
        : [];

    // ========================
    // 6. CREATE COURSE (IN TRANSACTION)
    // ========================
    const courseSlug = generateSlug(title);

    // Check for duplicate slug
    const existingCourse = await Course.findOne({ slug: courseSlug }).session(
      session,
    );
    if (existingCourse) {
      throw new Error("Course with similar title already exists");
    }

    const newCourse = new Course({
      // Basic Info
      title: title.trim(),
      description: description.trim(),
      shortDescription:
        shortDescription?.trim() || description.substring(0, 200) + "...",
      slug: courseSlug,

      // Categorization
      category,
      subcategory: subcategory || category,
      language,
      level,
      difficulty: difficulty || level,
      tags: tagArray,
      keywords: keywordArray,

      // Media
      thumbnail: uploadedThumbnail || "",
      promoVideo: uploadedPromoVideo || "",
      media: uploadedMedia,

      // Pricing
      price: validatedPrice,
      discountPrice: validatedDiscountPrice,
      currency,
      enrollmentType,
      isFree: validatedPrice === 0,

      // Content Structure
      sections: updatedSections,
      prerequisites: parsedPrerequisites,
      targetAudience: parsedTargetAudience,
      learningOutcomes: parsedLearningOutcomes,
      requirements: parsedRequirements,

      // Features
      isCertified: isCertified === true || isCertified === "true",
      certificateTemplate: certificateTemplate || "default",
      certificateIssuer: certificateIssuer || "Platform",
      featured: featured === true || featured === "true",
      trending: trending === true || trending === "true",
      allowReviews: allowReviews !== false,

      // Access & Duration
      accessType,
      validityPeriod: accessType === "subscription" ? 365 : 0, // days

      // Calculated Fields
      totalDuration: totalCourseDuration,
      totalLectures: totalCourseLectures,
      totalSections: updatedSections.length,
      totalResources: updatedSections.reduce(
        (sum, section) =>
          sum +
          section.videos.reduce(
            (vSum, video) => vSum + (video.resources?.length || 0),
            0,
          ),
        0,
      ),

      // Metadata
      metaTitle: metaTitle || title,
      metaDescription:
        metaDescription || shortDescription || description.substring(0, 160),

      // Messages
      welcomeMessage: welcomeMessage?.trim() || `Welcome to ${title}!`,
      completionMessage:
        completionMessage?.trim() || `Congratulations on completing ${title}!`,

      // Relationships
      instructor: instructorId,
      videos: createdVideoIds,
      createdBy: instructorId,

      // Status & Visibility
      status: "draft",
      visibility: "private",
      approvalStatus: "pending",
      publishedAt: null,

      // Analytics (initialize)
      analytics: {
        views: 0,
        enrollments: 0,
        completions: 0,
        avgRating: 0,
        totalReviews: 0,
        totalQuestions: 0,
        totalLikes: 0,
        totalDislikes: 0,
        revenue: 0,
        conversionRate: 0,
        completionRate: 0,
      },

      // Settings
      settings: {
        allowDownload: false,
        allowSharing: true,
        enableChat: true,
        enableNotes: true,
        enableBookmark: true,
        enableCertificate: isCertified,
        enableProgressTracking: true,
        requireQuizPassing: false,
        minCompletionPercentage: 80,
      },
    });

    await newCourse.save({ session });

    // ========================
    // 7. UPDATE VIDEOS WITH COURSE ID (BULK OPERATION)
    // ========================
    if (createdVideoIds.length > 0) {
      const bulkOps = createdVideoIds.map((videoId) => ({
        updateOne: {
          filter: { _id: videoId },
          update: {
            $set: {
              courseId: newCourse._id,
              status: "draft", // Keep as draft
            },
          },
        },
      }));

      await Video.bulkWrite(bulkOps, { session });
    }

    // ========================
    // 8. UPDATE TEACHER STATS
    // ========================
    await User.findByIdAndUpdate(
      instructorId,
      {
        $inc: {
          "teacherStats.totalCourses": 1,
          "teacherStats.draftCourses": 1,
        },
        $push: {
          coursesCreated: newCourse._id,
        },
      },
      { session },
    );

    // ========================
    // 9. COMMIT TRANSACTION
    // ========================
    await session.commitTransaction();

    // ========================
    // 10. CLEANUP TEMP FILES
    // ========================
    for (const filePath of tempFilesToDelete) {
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        console.warn("Failed to delete temp file:", cleanupError.message);
      }
    }

    // ========================
    // 11. POPULATE & RESPOND
    // ========================
    const populatedCourse = await Course.findById(newCourse._id)
      .populate("instructor", "name email avatar profileTitle bio")
      .populate({
        path: "videos",
        select: "title duration thumbnail order isPreview isFree status",
        match: { status: { $ne: "deleted" } },
      })
      .lean();

    res.status(201).json({
      success: true,
      message: "Course created successfully. Awaiting admin approval.",
      data: {
        course: {
          id: populatedCourse._id,
          title: populatedCourse.title,
          slug: populatedCourse.slug,
          status: populatedCourse.status,
          approvalStatus: populatedCourse.approvalStatus,
          thumbnail: populatedCourse.thumbnail,
          instructor: populatedCourse.instructor,
          stats: {
            sections: populatedCourse.sections.length,
            videos: populatedCourse.videos.length,
            totalDuration: populatedCourse.totalDuration,
            totalLectures: populatedCourse.totalLectures,
          },
          createdAt: populatedCourse.createdAt,
        },
        nextSteps: [
          "Add more course details",
          "Preview course structure",
          "Submit for review",
          "Set pricing and promotions",
        ],
        links: {
          edit: `/teacher/courses/${populatedCourse._id}/edit`,
          preview: `/teacher/courses/${populatedCourse._id}/preview`,
          publish: `/teacher/courses/${populatedCourse._id}/publish`,
        },
      },
      metadata: {
        transactionId: session.id,
        duration: `${totalCourseDuration} seconds`,
        videoCount: createdVideoIds.length,
        totalSize: "N/A", // Could calculate from video files
      },
    });
  } catch (error) {
    // ========================
    // ERROR HANDLING
    // ========================
    console.error("❌ Course creation failed:", error);

    // Rollback transaction
    await session.abortTransaction();

    // Cleanup created videos if any
    if (createdVideoIds.length > 0) {
      try {
        await Video.deleteMany({ _id: { $in: createdVideoIds } });
      } catch (cleanupError) {
        console.error("Failed to cleanup videos:", cleanupError);
      }
    }

    // Cleanup temp files
    for (const filePath of tempFilesToDelete) {
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }

    // Send appropriate error response
    const statusCode = error.name === "ValidationError" ? 400 : 500;
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Failed to create course. Please try again."
        : error.message;

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      code: error.code || "COURSE_CREATION_FAILED",
      details:
        process.env.NODE_ENV === "development"
          ? {
              error: error.message,
              stack: error.stack,
            }
          : undefined,
    });
  } finally {
    // ========================
    // FINALLY BLOCK
    // ========================
    session.endSession();
  }
};

module.exports = createTeacherCourse;

// Get single teacher course
const getTeacherCourseById = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;

    const course = await Course.findOne({
      _id: courseId,
      instructor: userId,
    }).populate("instructor", "name email");

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or unauthorized" });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update teacher course
const updateTeacherCourseForApprove = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;

    const course = await Course.findOne({
      _id: courseId,
      instructor: userId,
    });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or unauthorized" });
    }

    // Helper function to parse JSON fields
    const parseField = (value) => {
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch (e) {
          return value;
        }
      }
      return value;
    };

    // Helper function to handle array fields
    const handleArrayField = (value) => {
      if (Array.isArray(value)) return value;
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // If not JSON, split by comma
          return value
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t);
        }
      }
      return value;
    };

    // Define all fields that can be updated based on your schema
    const updateableFields = {
      // Basic info
      title: (val) => val,
      description: (val) => val,
      shortDescription: (val) => val,
      category: (val) => val,
      subcategory: (val) => val,
      language: (val) => val,
      level: (val) => val,

      // Media
      thumbnail: (val) => val,
      promoVideo: (val) => val,

      // Pricing
      price: (val) => Number(val),
      discountPrice: (val) => Number(val),
      currency: (val) => val,
      enrollmentType: (val) => val,

      // Course content
      sections: (val) => parseField(val),
      prerequisites: (val) => parseField(val),
      benefits: (val) => parseField(val),

      // New fields
      targetAudience: (val) => handleArrayField(val),
      learningOutcomes: (val) => handleArrayField(val),
      tags: (val) => handleArrayField(val),
      keywords: (val) => handleArrayField(val),

      // Boolean fields
      isCertified: (val) => val === "true" || val === true,
      featured: (val) => val === "true" || val === true,
      trending: (val) => val === "true" || val === true,

      // Other fields
      certificateTemplate: (val) => val,
      totalDuration: (val) => Number(val),
      totalLectures: (val) => Number(val),
      status: (val) => val,
    };

    // Process each field from request body
    Object.keys(req.body).forEach((field) => {
      // Handle thumbnailUrl -> thumbnail mapping
      const fieldName = field === "thumbnailUrl" ? "thumbnail" : field;

      if (updateableFields[fieldName] && req.body[field] !== undefined) {
        course[fieldName] = updateableFields[fieldName](req.body[field]);
      }
    });

    // Handle thumbnail upload if new thumbnail is provided via files
    if (req.files?.thumbnail) {
      const thumbnailFile = req.files.thumbnail;
      const uploaded = await uploadFileToCloudinary(thumbnailFile);

      if (uploaded?.url) {
        course.thumbnail = uploaded.url;
      }

      if (thumbnailFile.path) {
        fs.unlink(thumbnailFile.path, () => {});
      }
    } else if (
      req.body.thumbnailUrl &&
      !req.files?.thumbnail &&
      !course.thumbnail
    ) {
      // If thumbnailUrl is provided in body and no file upload
      course.thumbnail = req.body.thumbnailUrl;
    }

    // Handle media file uploads if provided
    // Handle multiple media file uploads
    // Handle media file uploads
    const mediaFiles = req.files?.media || []; // multiple files
    let newMediaUploads = [];

    // If new media uploaded
    if (mediaFiles.length > 0) {
      for (const file of mediaFiles) {
        const uploaded = await uploadFileToCloudinary(file);

        if (uploaded?.url) {
          newMediaUploads.push({
            url: uploaded.url,
            type: uploaded.resource_type || "image",
            pdfUrl: null,
          });
        }

        // Delete temp upload file
        fs.unlink(file.path, (err) => {
          if (err) console.error("Error deleting temp file:", err);
        });
      }

      // Replace old media
      course.media = newMediaUploads;
    }

    // Calculate totalDuration and totalLectures if sections are updated
    if (req.body.sections !== undefined) {
      let totalDuration = 0;
      let totalLectures = 0;

      course.sections.forEach((section) => {
        section.lectures.forEach((lecture) => {
          totalDuration += lecture.duration || 0;
          totalLectures += 1;
        });
      });

      course.totalDuration = totalDuration;
      course.totalLectures = totalLectures;
    }
    // ✅ Force status to pending when submitted for approval
    course.status = "pending";
    await course.save();

    // Get updated course with populated fields
    const updatedCourse = await Course.findById(course._id).populate(
      "instructor",
      "name email",
    );

    res.json({
      success: true,
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Update Course Error:", error);
    res.status(500).json({ message: error.message });
  }
};
// Update teacher course
const updateTeacherCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;

    const course = await Course.findOne({
      _id: courseId,
      instructor: userId,
    });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or unauthorized" });
    }

    // Helper function to parse JSON fields
    const parseField = (value) => {
      if (typeof value === "string") {
        // 1. മൂല്യം സ്ട്രിംഗ് ആണോ എന്ന് പരിശോധിക്കുന്നു
        try {
          return JSON.parse(value); // 2. ശ്രമിക്കുന്നു: സ്ട്രിംഗ് -> JSON ആക്കി മാറ്റാൻ
        } catch (e) {
          return value; // 3. പറ്റിയില്ലെങ്കിൽ: സ്ട്രിംഗ് തന്നെ തിരികെ നൽകുന്നു
        }
      }
      return value; // 4. സ്ട്രിംഗ് അല്ലെങ്കിൽ: അതേ മൂല്യം തിരികെ
    };

    // Helper function to handle array fields
    const handleArrayField = (value) => {
      if (Array.isArray(value)) return value; // 1. ഇതിനകം അറേ ആണെങ്കിൽ: തിരികെ നൽകുക

      if (typeof value === "string") {
        // 2. സ്ട്രിംഗ് ആണെങ്കിൽ:
        try {
          const parsed = JSON.parse(value); // 3. ശ്രമിക്കുന്നു: JSON ആക്കി മാറ്റാൻ
          return Array.isArray(parsed) ? parsed : [parsed]; // 4. അറേ ആയാൽ അത്, അല്ലാത്താൽ അറേയിൽ ഇടുക
        } catch (e) {
          // 5. JSON പാർസ് ചെയ്യാൻ പറ്റിയില്ലെങ്കിൽ:
          return value
            .split(",") // 6. കോമ കൊണ്ട് വേർതിരിക്കുക
            .map((t) => t.trim()) // 7. ഇടയിലെ സ്പേസ് നീക്കം ചെയ്യുക
            .filter((t) => t); // 8. ശൂന്യമായവ ഒഴിവാക്കുക
        }
      }
      return value; // 9. മറ്റെന്തെങ്കിലും ആണെങ്കിൽ: അതേ തിരികെ
    };

    // handleArrayField(['a', 'b']) → ['a', 'b']

    // handleArrayField('["student", "teacher"]') → ['student', 'teacher']

    // handleArrayField('HTML, CSS, JavaScript') → ['HTML', 'CSS', 'JavaScript']

    // handleArrayField('{"name": "test"}') → [{name: "test"}]
    // Define all fields that can be updated based on your schema
    const updateableFields = {
      // Basic info
      title: (val) => val,
      description: (val) => val,
      shortDescription: (val) => val,
      category: (val) => val,
      subcategory: (val) => val,
      language: (val) => val,
      level: (val) => val,

      // Media
      thumbnail: (val) => val,
      promoVideo: (val) => val,

      // Pricing
      price: (val) => Number(val),
      discountPrice: (val) => Number(val),
      currency: (val) => val,
      enrollmentType: (val) => val,

      // Course content
      sections: (val) => parseField(val),
      prerequisites: handleArrayField(val),

      benefits: (val) => parseField(val),

      // New fields
      targetAudience: (val) => handleArrayField(val),
      learningOutcomes: (val) => handleArrayField(val),
      tags: (val) => handleArrayField(val),
      keywords: (val) => handleArrayField(val),

      // Boolean fields
      isCertified: (val) => val === "true" || val === true,
      featured: (val) => val === "true" || val === true,
      trending: (val) => val === "true" || val === true,

      // Other fields
      certificateTemplate: (val) => val,
      totalDuration: (val) => Number(val),
      totalLectures: (val) => Number(val),
      status: (val) => val,
    };

    // Process each field from request body
    Object.keys(req.body).forEach((field) => {
      // Handle thumbnailUrl -> thumbnail mapping
      const fieldName = field === "thumbnailUrl" ? "thumbnail" : field;

      if (updateableFields[fieldName] && req.body[field] !== undefined) {
        course[fieldName] = updateableFields[fieldName](req.body[field]);
      }
    });

    // Handle thumbnail upload if new thumbnail is provided via files
    if (req.files?.thumbnail) {
      const thumbnailFile = req.files.thumbnail;
      const uploaded = await uploadFileToCloudinary(thumbnailFile);

      if (uploaded?.url) {
        course.thumbnail = uploaded.url;
      }

      if (thumbnailFile.path) {
        fs.unlink(thumbnailFile.path, () => {});
      }
    } else if (
      req.body.thumbnailUrl &&
      !req.files?.thumbnail &&
      !course.thumbnail
    ) {
      // If thumbnailUrl is provided in body and no file upload
      course.thumbnail = req.body.thumbnailUrl;
    }

    // Handle media file uploads if provided
    // Handle multiple media file uploads
    // Handle media file uploads
    const mediaFiles = req.files?.media || []; // multiple files
    let newMediaUploads = [];

    // If new media uploaded
    if (mediaFiles.length > 0) {
      for (const file of mediaFiles) {
        const uploaded = await uploadFileToCloudinary(file);

        if (uploaded?.url) {
          newMediaUploads.push({
            url: uploaded.url,
            type: uploaded.resource_type || "image",
            pdfUrl: null,
          });
        }

        // Delete temp upload file
        fs.unlink(file.path, (err) => {
          if (err) console.error("Error deleting temp file:", err);
        });
      }

      // Replace old media
      course.media = newMediaUploads;
    }

    // Calculate totalDuration and totalLectures if sections are updated
    if (req.body.sections !== undefined) {
      let totalDuration = 0;
      let totalLectures = 0;

      course.sections.forEach((section) => {
        section.lectures.forEach((lecture) => {
          totalDuration += lecture.duration || 0;
          totalLectures += 1;
        });
      });

      course.totalDuration = totalDuration;
      course.totalLectures = totalLectures;
    }

    await course.save();

    // Get updated course with populated fields
    const updatedCourse = await Course.findById(course._id).populate(
      "instructor",
      "name email",
    );

    res.json({
      success: true,
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Update Course Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update teacher course

// Delete teacher course
const deleteTeacherCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;

    const course = await Course.findOneAndDelete({
      _id: courseId,
      instructor: userId,
    });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or unauthorized" });
    }

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Publish teacher course
const publishTeacherCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;

    const course = await Course.findOne({
      _id: courseId,
      instructor: userId,
    });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or unauthorized" });
    }

    course.status = "published";
    await course.save();

    res.json({ message: "Course published successfully", course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unpublish teacher course
const unpublishTeacherCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;

    const course = await Course.findOne({
      _id: courseId,
      instructor: userId,
    });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or unauthorized" });
    }

    course.status = "draft";
    await course.save();

    res.json({ message: "Course unpublished successfully", course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Archive teacher course
const archiveTeacherCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;

    const course = await Course.findOne({
      _id: courseId,
      instructor: userId,
    });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or unauthorized" });
    }

    course.status = "archived";
    await course.save();

    res.json({ message: "Course archived successfully", course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Duplicate teacher course
const duplicateTeacherCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;

    const originalCourse = await Course.findOne({
      _id: courseId,
      instructor: userId,
    });

    if (!originalCourse) {
      return res
        .status(404)
        .json({ message: "Course not found or unauthorized" });
    }

    // Create a copy
    const courseData = originalCourse.toObject();
    delete courseData._id;
    delete courseData.createdAt;
    delete courseData.updatedAt;
    delete courseData.__v;

    // Modify title and status for the duplicate
    courseData.title = `${courseData.title} (Copy)`;
    courseData.status = "draft";

    const newCourse = new Course(courseData);
    await newCourse.save();

    res.json({ message: "Course duplicated successfully", course: newCourse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk actions for teacher courses
const bulkCourseAction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { action, courseIds } = req.body;

    if (!action || !courseIds || !Array.isArray(courseIds)) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const validActions = ["publish", "unpublish", "archive", "delete"];
    if (!validActions.includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    let result;
    switch (action) {
      case "publish":
        result = await Course.updateMany(
          { _id: { $in: courseIds }, instructor: userId },
          { $set: { status: "published" } },
        );
        break;

      case "unpublish":
        result = await Course.updateMany(
          { _id: { $in: courseIds }, instructor: userId },
          { $set: { status: "draft" } },
        );
        break;

      case "archive":
        result = await Course.updateMany(
          { _id: { $in: courseIds }, instructor: userId },
          { $set: { status: "archived" } },
        );
        break;

      case "delete":
        result = await Course.deleteMany({
          _id: { $in: courseIds },
          instructor: userId,
        });
        break;
    }

    res.json({
      message: `Bulk action '${action}' completed successfully`,
      modifiedCount: result.modifiedCount || result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTeacherCourses,
  getTeacherCourseStats,
  createTeacherCourse,
  getTeacherCourseById,
  updateTeacherCourse,
  deleteTeacherCourse,
  publishTeacherCourse,
  unpublishTeacherCourse,
  archiveTeacherCourse,
  duplicateTeacherCourse,
  bulkCourseAction,
  applyAsTeacher,
  getTeacherCoursesById,
  updateTeacherCourseForApprove,
};
