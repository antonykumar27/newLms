// src/pages/teacher/BecomeTeacher.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Briefcase,
  GraduationCap,
  Link as LinkIcon,
  BookOpen,
  Award,
  Code,
  Mic,
  Globe,
} from "lucide-react";
import { useAuth } from "../common/AuthContext";
import { useCreateApplyAsTeacherMutation } from "../store/api/TeacherCourseApi";

const TeacherApplicationForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Teaching Type
    teachingType: "school",

    // Personal Info
    bio: "",
    expertise: [],
    hourlyRate: "",

    // School teaching (Class 1-12)
    assignedClasses: [{ standard: "", subject: "", medium: "" }],

    // Exam/Competitive (PSC, UPSC, SSC, etc.)
    examCourses: [{ examName: "", subject: "", level: "" }],

    // Skill-based (Spoken English, Coding, etc.)
    skillCourses: [{ skillName: "", category: "", level: "" }],

    // Qualifications
    qualifications: [
      {
        degree: "",
        institution: "",
        year: "",
        certificateUrl: "",
      },
    ],

    // Experience
    experience: [
      {
        position: "",
        organization: "",
        startDate: "",
        endDate: "",
        currentlyWorking: false,
      },
    ],

    // Social Links
    socialLinks: {
      linkedin: "https://linkedin.com/in/yourprofile",
      github: "https://github.com/yourusername",
      twitter: "",
      website: "https://yourwebsite.com",
    },

    // Documents
    resume: null,
    idProof: null,

    // Agreement
    agreeToTerms: false,
  });

  console.log("formData", formData);

  // Teaching Type Options
  const TEACHING_TYPES = [
    { value: "school", label: "School (Class 1-12)", icon: BookOpen },
    { value: "exam", label: "Competitive Exams (PSC, UPSC)", icon: Award },
    { value: "skill", label: "Skills/Language/Professional", icon: Code },
  ];

  const expertiseOptions = [
    // School Subjects
    "Mathematics",
    "Science",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Malayalam",
    "Hindi",
    "Social Science",
    "ICT",

    // Competitive Exams
    "PSC",
    "UPSC",
    "SSC",
    "Banking",
    "Railway",
    "Defense",
    "Current Affairs",
    "General Knowledge",
    "Reasoning",
    "Quantitative Aptitude",

    // Skills & Languages
    "Spoken English",
    "Public Speaking",
    "Creative Writing",
    "Web Development",
    "Mobile Development",
    "Data Science",
    "Machine Learning",
    "UI/UX Design",
    "Digital Marketing",
    "Business",
    "Finance",
    "Photography",
    "Music",
    "Art",

    // Languages
    "English Language",
    "Malayalam Language",
    "Hindi Language",
    "French",
    "Spanish",
    "German",
    "Japanese",
  ];

  const STANDARDS = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ];

  const SUBJECTS = {
    school: [
      "Malayalam",
      "English",
      "Mathematics",
      "Hindi",
      "Social Science",
      "Physics",
      "Chemistry",
      "Biology",
      "ICT",
      "Basic Science",
      "Geography",
      "History",
      "Economics",
      "Computer Science",
    ],
    exam: [
      "General Studies",
      "Current Affairs",
      "Quantitative Aptitude",
      "Reasoning",
      "English Language",
      "Malayalam Language",
      "General Knowledge",
      "Indian Polity",
      "History",
      "Geography",
      "Economics",
      "Science",
      "Mathematics",
      "Mental Ability",
    ],
    skill: [
      "Spoken English",
      "Communication Skills",
      "Public Speaking",
      "Creative Writing",
      "Web Development",
      "Mobile App Development",
      "Data Science",
      "Machine Learning",
      "Digital Marketing",
      "Graphic Design",
      "Photography",
      "Music",
      "Art & Craft",
      "Cooking",
      "Fitness Training",
      "Business Management",
    ],
  };

  const MEDIUMS = ["English", "Malayalam", "Hindi", "Bilingual"];

  const EXAM_LEVELS = ["Prelims", "Mains", "Interview", "All Levels"];

  const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

  const SKILL_CATEGORIES = [
    "Language",
    "Technology",
    "Business",
    "Creative",
    "Professional",
    "Academic",
    "Lifestyle",
    "Other",
  ];

  const POPULAR_EXAMS = [
    "Kerala PSC",
    "UPSC Civil Services",
    "SSC",
    "Banking Exams",
    "Railway Exams",
    "Defense Exams",
    "Teaching Exams",
    "Medical Exams",
    "Engineering Exams",
    "Law Entrance",
    "Other Competitive Exams",
  ];

  const [applyAsTeacher, { isLoading, isSuccess, error }] =
    useCreateApplyAsTeacherMutation();

  // Handle basic input changes
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle changes in arrays (qualifications, experience, etc.)
  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  // Add new qualification
  const addQualification = () => {
    setFormData((prev) => ({
      ...prev,
      qualifications: [
        ...prev.qualifications,
        { degree: "", institution: "", year: "", certificateUrl: "" },
      ],
    }));
  };

  // Add new experience
  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          position: "",
          organization: "",
          startDate: "",
          endDate: "",
          currentlyWorking: false,
        },
      ],
    }));
  };

  // Add new class (for school teaching)
  const addClass = () => {
    setFormData((prev) => ({
      ...prev,
      assignedClasses: [
        ...prev.assignedClasses,
        { standard: "", subject: "", medium: "" },
      ],
    }));
  };

  // Remove class
  const removeClass = (index) => {
    setFormData((prev) => ({
      ...prev,
      assignedClasses: prev.assignedClasses.filter((_, i) => i !== index),
    }));
  };

  // Add new exam course
  const addExamCourse = () => {
    setFormData((prev) => ({
      ...prev,
      examCourses: [
        ...prev.examCourses,
        { examName: "", subject: "", level: "" },
      ],
    }));
  };

  // Remove exam course
  const removeExamCourse = (index) => {
    setFormData((prev) => ({
      ...prev,
      examCourses: prev.examCourses.filter((_, i) => i !== index),
    }));
  };

  // Add new skill course
  const addSkillCourse = () => {
    setFormData((prev) => ({
      ...prev,
      skillCourses: [
        ...prev.skillCourses,
        { skillName: "", category: "", level: "" },
      ],
    }));
  };

  // Remove skill course
  const removeSkillCourse = (index) => {
    setFormData((prev) => ({
      ...prev,
      skillCourses: prev.skillCourses.filter((_, i) => i !== index),
    }));
  };

  // Handle class changes
  const handleClassChange = (index, field, value) => {
    const updatedClasses = [...formData.assignedClasses];
    updatedClasses[index][field] = value;

    setFormData({
      ...formData,
      assignedClasses: updatedClasses,
    });
  };

  // Handle exam course changes
  const handleExamCourseChange = (index, field, value) => {
    const updatedCourses = [...formData.examCourses];
    updatedCourses[index][field] = value;

    setFormData({
      ...formData,
      examCourses: updatedCourses,
    });
  };

  // Handle skill course changes
  const handleSkillCourseChange = (index, field, value) => {
    const updatedCourses = [...formData.skillCourses];
    updatedCourses[index][field] = value;

    setFormData({
      ...formData,
      skillCourses: updatedCourses,
    });
  };

  // Handle expertise selection
  const handleExpertiseToggle = (skill) => {
    setFormData((prev) => {
      const exists = prev.expertise.find((e) => e.name === skill);

      if (exists) {
        return {
          ...prev,
          expertise: prev.expertise.filter((e) => e.name !== skill),
        };
      }

      return {
        ...prev,
        expertise: [...prev.expertise, { name: skill, level: "beginner" }],
      };
    });
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Basic information
      formDataToSend.append("bio", formData.bio);
      formDataToSend.append("teachingType", formData.teachingType);

      // Expertise
      const cleanedExpertise = (formData.expertise || []).filter(
        (e) => typeof e === "object" && e.name && e.level,
      );
      formDataToSend.append("expertise", JSON.stringify(cleanedExpertise));

      formDataToSend.append("hourlyRate", formData.hourlyRate);

      // Teaching type specific data
      if (formData.teachingType === "school") {
        formDataToSend.append(
          "assignedClasses",
          JSON.stringify(formData.assignedClasses),
        );
      } else if (formData.teachingType === "exam") {
        formDataToSend.append(
          "examCourses",
          JSON.stringify(formData.examCourses),
        );
      } else if (formData.teachingType === "skill") {
        formDataToSend.append(
          "skillCourses",
          JSON.stringify(formData.skillCourses),
        );
      }

      // Common fields
      formDataToSend.append(
        "qualifications",
        JSON.stringify(formData.qualifications),
      );
      formDataToSend.append("experience", JSON.stringify(formData.experience));
      formDataToSend.append(
        "socialLinks",
        JSON.stringify(formData.socialLinks),
      );

      // Files
      if (formData.resume) {
        formDataToSend.append("resume", formData.resume);
      }

      if (formData.idProof) {
        formDataToSend.append("idProof", formData.idProof);
      }

      formDataToSend.append("agreeToTerms", String(formData.agreeToTerms));

      await applyAsTeacher(formDataToSend).unwrap();
      navigate("/teacher/application-success");
    } catch (err) {
      console.error(err);
      alert(err?.data?.message || "Application failed");
    } finally {
      setLoading(false);
    }
  };

  // Get subjects based on teaching type
  const getSubjects = () => {
    return SUBJECTS[formData.teachingType] || SUBJECTS.school;
  };

  // Render steps
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Teaching Type Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                What do you want to teach?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {TEACHING_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={type.value}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          teachingType: type.value,
                        }))
                      }
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.teachingType === type.value
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <Icon
                          className={`w-5 h-5 mr-2 ${
                            formData.teachingType === type.value
                              ? "text-orange-600"
                              : "text-gray-500"
                          }`}
                        />
                        <span className="font-medium">{type.label}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {type.value === "school" &&
                          "Teach students from Class 1 to 12"}
                        {type.value === "exam" &&
                          "Prepare students for competitive exams"}
                        {type.value === "skill" &&
                          "Teach skills, languages, or professional courses"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bio Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Tell us about yourself
              </h3>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio/Introduction
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Introduce yourself and your teaching philosophy..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            {/* Teaching Details Based on Type */}
            {formData.teachingType === "school" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Classes & Subjects you teach
                </label>

                {formData.assignedClasses.map((cls, index) => (
                  <div key={index} className="flex gap-3 mb-3 items-center">
                    {/* Standard */}
                    <select
                      value={cls.standard}
                      onChange={(e) =>
                        handleClassChange(index, "standard", e.target.value)
                      }
                      className="w-1/4 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="">Select Class</option>
                      {STANDARDS.map((std) => (
                        <option key={std} value={std}>
                          Class {std}
                        </option>
                      ))}
                    </select>

                    {/* Subject */}
                    <select
                      value={cls.subject}
                      onChange={(e) =>
                        handleClassChange(index, "subject", e.target.value)
                      }
                      className="w-2/4 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="">Select Subject</option>
                      {getSubjects().map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>

                    {/* Medium */}
                    <select
                      value={cls.medium}
                      onChange={(e) =>
                        handleClassChange(index, "medium", e.target.value)
                      }
                      className="w-1/4 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="">Select Medium</option>
                      {MEDIUMS.map((med) => (
                        <option key={med} value={med.toLowerCase()}>
                          {med}
                        </option>
                      ))}
                    </select>

                    {/* Remove Button */}
                    {formData.assignedClasses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeClass(index)}
                        className="text-red-500 font-bold px-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                {/* Add Button */}
                <button
                  type="button"
                  onClick={addClass}
                  className="mt-2 text-sm text-orange-600 font-medium flex items-center"
                >
                  <span className="mr-1">+</span> Add another class
                </button>
              </div>
            )}

            {formData.teachingType === "exam" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Competitive Exams you teach
                </label>

                {formData.examCourses.map((exam, index) => (
                  <div key={index} className="flex gap-3 mb-3 items-center">
                    {/* Exam Name */}
                    <select
                      value={exam.examName}
                      onChange={(e) =>
                        handleExamCourseChange(
                          index,
                          "examName",
                          e.target.value,
                        )
                      }
                      className="w-2/5 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="">Select Exam</option>
                      {POPULAR_EXAMS.map((ex) => (
                        <option key={ex} value={ex}>
                          {ex}
                        </option>
                      ))}
                      <option value="other">Other Exam</option>
                    </select>

                    {/* Subject */}
                    <select
                      value={exam.subject}
                      onChange={(e) =>
                        handleExamCourseChange(index, "subject", e.target.value)
                      }
                      className="w-2/5 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="">Select Subject</option>
                      {getSubjects().map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>

                    {/* Level */}
                    <select
                      value={exam.level}
                      onChange={(e) =>
                        handleExamCourseChange(index, "level", e.target.value)
                      }
                      className="w-1/5 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="">Level</option>
                      {EXAM_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl.toLowerCase()}>
                          {lvl}
                        </option>
                      ))}
                    </select>

                    {/* Remove Button */}
                    {formData.examCourses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExamCourse(index)}
                        className="text-red-500 font-bold px-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                {/* Custom Exam Input */}
                {formData.examCourses.some((ex) => ex.examName === "other") && (
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="Please specify the exam name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      onChange={(e) => {
                        const index = formData.examCourses.findIndex(
                          (ex) => ex.examName === "other",
                        );
                        if (index !== -1) {
                          handleExamCourseChange(
                            index,
                            "examName",
                            e.target.value,
                          );
                        }
                      }}
                    />
                  </div>
                )}

                {/* Add Button */}
                <button
                  type="button"
                  onClick={addExamCourse}
                  className="mt-2 text-sm text-orange-600 font-medium flex items-center"
                >
                  <span className="mr-1">+</span> Add another exam
                </button>
              </div>
            )}

            {formData.teachingType === "skill" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills you teach
                </label>

                {formData.skillCourses.map((skill, index) => (
                  <div key={index} className="flex gap-3 mb-3 items-center">
                    {/* Skill Name */}
                    <input
                      type="text"
                      value={skill.skillName}
                      onChange={(e) =>
                        handleSkillCourseChange(
                          index,
                          "skillName",
                          e.target.value,
                        )
                      }
                      placeholder="e.g., Spoken English, Web Development"
                      className="w-2/5 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                      required
                    />

                    {/* Category */}
                    <select
                      value={skill.category}
                      onChange={(e) =>
                        handleSkillCourseChange(
                          index,
                          "category",
                          e.target.value,
                        )
                      }
                      className="w-2/5 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {SKILL_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    {/* Level */}
                    <select
                      value={skill.level}
                      onChange={(e) =>
                        handleSkillCourseChange(index, "level", e.target.value)
                      }
                      className="w-1/5 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="">Level</option>
                      {SKILL_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl.toLowerCase()}>
                          {lvl}
                        </option>
                      ))}
                    </select>

                    {/* Remove Button */}
                    {formData.skillCourses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSkillCourse(index)}
                        className="text-red-500 font-bold px-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                {/* Add Button */}
                <button
                  type="button"
                  onClick={addSkillCourse}
                  className="mt-2 text-sm text-orange-600 font-medium flex items-center"
                >
                  <span className="mr-1">+</span> Add another skill
                </button>
              </div>
            )}

            {/* Expertise Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Areas of Expertise
              </label>

              <div className="flex flex-wrap gap-2">
                {expertiseOptions.map((skill) => {
                  const selected = formData.expertise.find(
                    (e) => e.name === skill,
                  );

                  return (
                    <div key={skill} className="flex items-center gap-2">
                      {/* Skill button */}
                      <button
                        type="button"
                        onClick={() => handleExpertiseToggle(skill)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          selected
                            ? "bg-orange-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {skill}
                      </button>

                      {/* Level selector (only if selected) */}
                      {selected && (
                        <select
                          value={selected.level}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              expertise: prev.expertise.map((ex) =>
                                ex.name === skill
                                  ? { ...ex, level: e.target.value }
                                  : ex,
                              ),
                            }))
                          }
                          className="px-2 py-1 text-sm border rounded-md"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="expert">Expert</option>
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hourly Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hourly Rate (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₹
                </span>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  placeholder="e.g., 500"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Qualifications</h3>
              <button
                type="button"
                onClick={addQualification}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                + Add Another
              </button>
            </div>

            {formData.qualifications.map((qual, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg space-y-4"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Degree/Certificate
                    </label>
                    <input
                      type="text"
                      value={qual.degree}
                      onChange={(e) =>
                        handleArrayChange(
                          "qualifications",
                          index,
                          "degree",
                          e.target.value,
                        )
                      }
                      placeholder="e.g., B.Sc Computer Science"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Institution
                    </label>
                    <input
                      type="text"
                      value={qual.institution}
                      onChange={(e) =>
                        handleArrayChange(
                          "qualifications",
                          index,
                          "institution",
                          e.target.value,
                        )
                      }
                      placeholder="e.g., University of Kerala"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year of Completion
                    </label>
                    <input
                      type="number"
                      value={qual.year}
                      onChange={(e) =>
                        handleArrayChange(
                          "qualifications",
                          index,
                          "year",
                          e.target.value,
                        )
                      }
                      placeholder="e.g., 2020"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Certificate URL
                    </label>
                    <input
                      type="url"
                      value={qual.certificateUrl}
                      onChange={(e) =>
                        handleArrayChange(
                          "qualifications",
                          index,
                          "certificateUrl",
                          e.target.value,
                        )
                      }
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between mt-8">
              <h3 className="text-lg font-semibold">Experience</h3>
              <button
                type="button"
                onClick={addExperience}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                + Add Experience
              </button>
            </div>

            {formData.experience.map((exp, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg space-y-4"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) =>
                        handleArrayChange(
                          "experience",
                          index,
                          "position",
                          e.target.value,
                        )
                      }
                      placeholder="e.g., Senior Teacher"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization
                    </label>
                    <input
                      type="text"
                      value={exp.organization}
                      onChange={(e) =>
                        handleArrayChange(
                          "experience",
                          index,
                          "organization",
                          e.target.value,
                        )
                      }
                      placeholder="e.g., St. Thomas School"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={exp.startDate}
                      onChange={(e) =>
                        handleArrayChange(
                          "experience",
                          index,
                          "startDate",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={exp.currentlyWorking ? "" : exp.endDate}
                      onChange={(e) =>
                        handleArrayChange(
                          "experience",
                          index,
                          "endDate",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      disabled={exp.currentlyWorking}
                      required={!exp.currentlyWorking}
                    />
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        checked={exp.currentlyWorking}
                        onChange={(e) =>
                          handleArrayChange(
                            "experience",
                            index,
                            "currentlyWorking",
                            e.target.checked,
                          )
                        }
                        className="h-4 w-4 text-orange-600"
                        id={`currentlyWorking-${index}`}
                      />
                      <label
                        htmlFor={`currentlyWorking-${index}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        I currently work here
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Social Links</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn URL
                </label>
                <div className="flex items-center">
                  <LinkIcon className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="url"
                    name="socialLinks.linkedin"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          linkedin: e.target.value,
                        },
                      }))
                    }
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GitHub URL
                </label>
                <div className="flex items-center">
                  <LinkIcon className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="url"
                    name="socialLinks.github"
                    value={formData.socialLinks.github}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          github: e.target.value,
                        },
                      }))
                    }
                    placeholder="https://github.com/yourusername"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Website/Blog
                </label>
                <div className="flex items-center">
                  <LinkIcon className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="url"
                    name="socialLinks.website"
                    value={formData.socialLinks.website}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          website: e.target.value,
                        },
                      }))
                    }
                    placeholder="https://yourwebsite.com"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Documents</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume/CV
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                    <input
                      type="file"
                      name="resume"
                      onChange={handleChange}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">
                        {formData.resume
                          ? `Selected: ${formData.resume.name}`
                          : "Upload your resume (PDF/DOC)"}
                      </p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Proof
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                    <input
                      type="file"
                      name="idProof"
                      onChange={handleChange}
                      accept="image/*,.pdf"
                      className="hidden"
                      id="idProof-upload"
                    />
                    <label htmlFor="idProof-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">
                        {formData.idProof
                          ? `Selected: ${formData.idProof.name}`
                          : "Upload ID proof (Passport/Driver's License)"}
                      </p>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Review & Submit</h3>

            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              {/* Teaching Type */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Teaching Type
                </h4>
                <p className="text-gray-600">
                  {
                    TEACHING_TYPES.find(
                      (t) => t.value === formData.teachingType,
                    )?.label
                  }
                </p>
              </div>

              {/* Teaching Details */}
              {formData.teachingType === "school" && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Classes & Subjects
                  </h4>
                  {formData.assignedClasses.map((cls, index) => (
                    <div key={index} className="mb-2">
                      Class {cls.standard} - {cls.subject} ({cls.medium})
                    </div>
                  ))}
                </div>
              )}

              {formData.teachingType === "exam" && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Competitive Exams
                  </h4>
                  {formData.examCourses.map((exam, index) => (
                    <div key={index} className="mb-2">
                      {exam.examName} - {exam.subject} ({exam.level})
                    </div>
                  ))}
                </div>
              )}

              {formData.teachingType === "skill" && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Skills to Teach
                  </h4>
                  {formData.skillCourses.map((skill, index) => (
                    <div key={index} className="mb-2">
                      {skill.skillName} ({skill.category}) - {skill.level}
                    </div>
                  ))}
                </div>
              )}

              {/* Personal Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Personal Information
                </h4>
                <p className="text-gray-600">{formData.bio}</p>
                <div className="mt-2">
                  <span className="font-medium">Expertise:</span>{" "}
                  {formData.expertise.map((e) => e.name).join(", ") ||
                    "None selected"}
                </div>
              </div>

              {/* Qualifications */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Qualifications
                </h4>
                {formData.qualifications.map((qual, index) => (
                  <div key={index} className="mb-2">
                    {qual.degree} from {qual.institution} ({qual.year})
                  </div>
                ))}
              </div>

              {/* Experience */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Experience</h4>
                {formData.experience.map((exp, index) => (
                  <div key={index} className="mb-2">
                    {exp.position} at {exp.organization} ({exp.startDate} -{" "}
                    {exp.currentlyWorking ? "Present" : exp.endDate})
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">
                Important Information
              </h4>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>
                  • Your application will be reviewed within 3-5 business days
                </li>
                <li>• You'll receive an email notification about the status</li>
                <li>
                  • Once approved, you can start creating courses immediately
                </li>
                <li>
                  • You'll earn 70% of course revenue (platform takes 30%)
                </li>
              </ul>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="h-4 w-4 text-orange-600"
                id="agreeToTerms"
                required
              />
              <label
                htmlFor="agreeToTerms"
                className="ml-2 text-sm text-gray-700"
              >
                I agree to the{" "}
                <a
                  href="/terms/instructor"
                  className="text-orange-600 hover:underline"
                >
                  Instructor Terms
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-orange-600 hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Become an Instructor
                </h1>
                <p className="text-gray-600">
                  Complete your teacher application
                </p>
              </div>
              <div className="text-sm text-gray-500">Step {step} of 4</div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>

            <div className="flex justify-between mt-2">
              <span
                className={`text-sm ${
                  step >= 1 ? "text-orange-600 font-medium" : "text-gray-500"
                }`}
              >
                Personal Info
              </span>
              <span
                className={`text-sm ${
                  step >= 2 ? "text-orange-600 font-medium" : "text-gray-500"
                }`}
              >
                Qualifications
              </span>
              <span
                className={`text-sm ${
                  step >= 3 ? "text-orange-600 font-medium" : "text-gray-500"
                }`}
              >
                Documents
              </span>
              <span
                className={`text-sm ${
                  step >= 4 ? "text-orange-600 font-medium" : "text-gray-500"
                }`}
              >
                Review
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
              {renderStep()}

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                ) : (
                  <div></div>
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !formData.agreeToTerms}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? "Submitting..." : "Submit Application"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherApplicationForm;
