import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Settings,
  Image as ImageIcon,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion } from "framer-motion";
import { useInsertQuestionsMutation } from "../../store/api/QuizApi";
import { toast } from "react-toastify";
import { useParams, useLocation } from "react-router-dom";
import MarkdownPreview from "./MarkdownPreview";

function EachChapterRelatedQuiz() {
  const [insertQuiz, { isLoading, isSuccess, isError, error }] =
    useInsertQuestionsMutation();
  const { id } = useParams();
  const location = useLocation();
  const pageId = location.state?.pageId;
  console.log("pageId", pageId);
  // Helper function for default options
  const defaultOptions = () => [
    { id: 1, value: "", optionImage: null, optionImageUrl: "" },
    { id: 2, value: "", optionImage: null, optionImageUrl: "" },
  ];

  // Add state for preview mode
  const [previewModes, setPreviewModes] = useState({
    questions: {},
    options: {},
    correctAnswers: {},
  });

  // Toggle preview for a specific field
  const togglePreview = (field, qIndex, oIndex = null) => {
    const key = oIndex !== null ? `q${qIndex}_o${oIndex}` : `q${qIndex}`;

    setPreviewModes((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [key]: !prev[field][key],
      },
    }));
  };

  // Simplified state - only pageId and questions
  const [quiz, setQuiz] = useState({
    pageId: id,
    questions: [
      {
        id: Date.now(),
        question: "",
        questionImage: null,
        questionImageUrl: "",
        questionType: "single", // single | multiple | text
        options: defaultOptions(),
        correctAnswer: "", // string for single/text, array for multiple
        hint: "", // For text questions
      },
    ],
  });

  const [activeQuestion, setActiveQuestion] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Scroll to active question
  useEffect(() => {
    const timer = setTimeout(() => {
      const element = document.getElementById(`question-${activeQuestion}`);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activeQuestion]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const element = document.getElementById(`question-${activeQuestion}`);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [quiz.questions.length]);

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...quiz.questions];

    if (field === "questionType") {
      if (value === "single") {
        updatedQuestions[index].options = defaultOptions();
        updatedQuestions[index].correctAnswer = "";
        updatedQuestions[index].hint = "";
      } else if (value === "multiple") {
        updatedQuestions[index].options = defaultOptions();
        updatedQuestions[index].correctAnswer = [];
        updatedQuestions[index].hint = "";
      } else if (value === "text") {
        updatedQuestions[index].options = [];
        updatedQuestions[index].correctAnswer = "";
      }
    }

    updatedQuestions[index][field] = value;
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const handleOptionChange = (qIndex, oIndex, field, value) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[qIndex].options[oIndex][field] = value;
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  // Image Upload Handlers
  const handleQuestionImageUpload = async (qIndex, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const imageUrl = URL.createObjectURL(file);
      const updatedQuestions = [...quiz.questions];
      updatedQuestions[qIndex].questionImage = file;
      updatedQuestions[qIndex].questionImageUrl = imageUrl;
      setQuiz({ ...quiz, questions: updatedQuestions });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeQuestionImage = (qIndex) => {
    const updatedQuestions = [...quiz.questions];
    if (updatedQuestions[qIndex].questionImageUrl) {
      URL.revokeObjectURL(updatedQuestions[qIndex].questionImageUrl);
    }
    updatedQuestions[qIndex].questionImage = null;
    updatedQuestions[qIndex].questionImageUrl = "";
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const handleOptionImageUpload = async (qIndex, oIndex, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const imageUrl = URL.createObjectURL(file);
      const updatedQuestions = [...quiz.questions];
      updatedQuestions[qIndex].options[oIndex].optionImage = file;
      updatedQuestions[qIndex].options[oIndex].optionImageUrl = imageUrl;
      setQuiz({ ...quiz, questions: updatedQuestions });
    } catch (error) {
      console.error("Error uploading option image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeOptionImage = (qIndex, oIndex) => {
    const updatedQuestions = [...quiz.questions];
    if (updatedQuestions[qIndex].options[oIndex].optionImageUrl) {
      URL.revokeObjectURL(
        updatedQuestions[qIndex].options[oIndex].optionImageUrl,
      );
    }
    updatedQuestions[qIndex].options[oIndex].optionImage = null;
    updatedQuestions[qIndex].options[oIndex].optionImageUrl = "";
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  // Correct Answer Handlers
  const handleCorrectAnswerChange = (qIndex, oIndex) => {
    const updatedQuestions = [...quiz.questions];
    const question = updatedQuestions[qIndex];

    if (question.questionType === "single") {
      updatedQuestions[qIndex].correctAnswer = oIndex;
    } else if (question.questionType === "multiple") {
      const currentAnswers = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [];
      if (currentAnswers.includes(oIndex)) {
        updatedQuestions[qIndex].correctAnswer = currentAnswers.filter(
          (ans) => ans !== oIndex,
        );
      } else {
        updatedQuestions[qIndex].correctAnswer = [...currentAnswers, oIndex];
      }
    }
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: "",
      questionImage: null,
      questionImageUrl: "",
      questionType: "single",
      options: defaultOptions(),
      correctAnswer: "",
      hint: "",
    };

    setQuiz({
      ...quiz,
      questions: [...quiz.questions, newQuestion],
    });
    setActiveQuestion(quiz.questions.length);
  };

  const removeQuestion = (index) => {
    if (quiz.questions.length <= 1) return;
    const updated = [...quiz.questions];
    if (updated[index].questionImageUrl) {
      URL.revokeObjectURL(updated[index].questionImageUrl);
    }
    updated[index].options.forEach((option) => {
      if (option.optionImageUrl) {
        URL.revokeObjectURL(option.optionImageUrl);
      }
    });
    updated.splice(index, 1);
    setQuiz({ ...quiz, questions: updated });

    if (index === activeQuestion && index > 0) {
      setActiveQuestion(index - 1);
    } else if (index < activeQuestion) {
      setActiveQuestion(activeQuestion - 1);
    }
  };

  const addOption = (qIndex) => {
    const updatedQuestions = [...quiz.questions];
    const newOptionId =
      Math.max(...updatedQuestions[qIndex].options.map((o) => o.id), 0) + 1;
    updatedQuestions[qIndex].options.push({
      id: newOptionId,
      value: "",
      optionImage: null,
      optionImageUrl: "",
    });
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const removeOption = (qIndex, oIndex) => {
    if (quiz.questions[qIndex].options.length <= 2) return;
    const updatedQuestions = [...quiz.questions];
    if (updatedQuestions[qIndex].options[oIndex].optionImageUrl) {
      URL.revokeObjectURL(
        updatedQuestions[qIndex].options[oIndex].optionImageUrl,
      );
    }
    updatedQuestions[qIndex].options.splice(oIndex, 1);

    const question = updatedQuestions[qIndex];
    if (question.questionType === "single") {
      if (question.correctAnswer === oIndex) {
        updatedQuestions[qIndex].correctAnswer = "";
      } else if (question.correctAnswer > oIndex) {
        updatedQuestions[qIndex].correctAnswer = question.correctAnswer - 1;
      }
    } else if (question.questionType === "multiple") {
      updatedQuestions[qIndex].correctAnswer = question.correctAnswer
        .map((ans) => (ans > oIndex ? ans - 1 : ans))
        .filter((ans) => ans !== oIndex);
    }
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  // Add Markdown Help Button Component
  const MarkdownHelpButton = () => (
    <div className="relative group">
      <button
        type="button"
        className="text-xs text-indigo-600 hover:text-indigo-800 underline"
        onClick={() =>
          toast.info(
            <div className="text-sm">
              <h4 className="font-bold mb-2">Markdown & LaTeX Support:</h4>
              <ul className="space-y-1">
                <li>
                  <strong>Bold</strong>: <code>**text**</code>
                </li>
                <li>
                  <em>Italic</em>: <code>*text*</code>
                </li>
                <li>
                  Inline Math: <code>$E = mc^2$</code>
                </li>
                <li>
                  Block Math:
                  <code>
                    {`$$
f(x) = \\int_{-\\infty}^{\\infty} \\hat f(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi
$$`}
                  </code>
                </li>

                <li>
                  Code: <code>```javascript\ncode\n```</code>
                </li>
                <li>
                  Lists: <code>- Item 1</code> or <code>1. Item 1</code>
                </li>
              </ul>
            </div>,
            { autoClose: 10000 },
          )
        }
      >
        Markdown & LaTeX Supported
      </button>
      <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        Click for formatting help. Supports math equations, code blocks, and
        markdown.
      </div>
    </div>
  );

  // Modified Question Input Section with Preview
  const renderQuestionInput = (q, qIndex) => (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="block font-medium text-slate-700">
          Question {qIndex + 1}
        </label>
        <MarkdownHelpButton />
      </div>

      <div className="flex gap-3 mb-3">
        <div className="flex-1">
          {/* Input/Preview Toggle */}
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-600">
              {previewModes.questions[`q${qIndex}`] ? "Preview" : "Edit"}
            </div>
            <button
              type="button"
              onClick={() => togglePreview("questions", qIndex)}
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
            >
              {previewModes.questions[`q${qIndex}`] ? (
                <>
                  <EyeOff size={14} />
                  Edit
                </>
              ) : (
                <>
                  <Eye size={14} />
                  Preview
                </>
              )}
            </button>
          </div>

          {/* Conditional Rendering: Input or Preview */}
          {previewModes.questions[`q${qIndex}`] ? (
            <div className="min-h-[60px] p-3 border border-slate-300 rounded-lg bg-white">
              <MarkdownPreview
                content={q.question || "*No question entered*"}
                className="text-slate-800"
              />
            </div>
          ) : (
            <textarea
              placeholder="Enter your question (Markdown & LaTeX supported)...\nExample: Solve for x: $x^2 - 4 = 0$\n**Hint:** Factor the equation."
              value={q.question}
              onChange={(e) =>
                handleQuestionChange(qIndex, "question", e.target.value)
              }
              className="w-full h-32 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
              rows={4}
            />
          )}
        </div>

        {/* Image Upload Section */}
        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg cursor-pointer hover:bg-slate-200 transition-colors">
            <ImageIcon size={18} />
            {q.questionImage ? "Change" : "Add Image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                handleQuestionImageUpload(qIndex, e.target.files[0])
              }
            />
          </label>

          {q.questionImageUrl && (
            <button
              type="button"
              onClick={() => removeQuestionImage(qIndex)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              title="Remove image"
            >
              <XCircle size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Question Image Preview */}
      {q.questionImageUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3"
        >
          <div className="relative inline-block">
            <img
              src={q.questionImageUrl}
              alt="Question preview"
              className="max-h-48 rounded-lg border border-slate-300"
            />
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              Question Image
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  // Modified Option Input with Preview
  const renderOptionInput = (q, qIndex, opt, oIndex) => (
    <div key={opt.id} className="space-y-2">
      <div className="flex items-center gap-3">
        {/* Selection Indicator */}
        <div className="flex-shrink-0">
          {q.questionType === "single" ? (
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                q.correctAnswer === oIndex
                  ? "border-indigo-600 bg-indigo-600"
                  : "border-slate-400"
              }`}
              onClick={() => handleCorrectAnswerChange(qIndex, oIndex)}
            >
              {q.correctAnswer === oIndex && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
          ) : (
            <div
              className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer ${
                q.correctAnswer.includes(oIndex)
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-400"
              }`}
              onClick={() => handleCorrectAnswerChange(qIndex, oIndex)}
            >
              {q.correctAnswer.includes(oIndex) && <Check size={12} />}
            </div>
          )}
        </div>

        {/* Option Input with Preview */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-slate-600">
              {previewModes.options[`q${qIndex}_o${oIndex}`]
                ? "Preview"
                : "Edit"}
            </div>
            <button
              type="button"
              onClick={() => togglePreview("options", qIndex, oIndex)}
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              {previewModes.options[`q${qIndex}_o${oIndex}`]
                ? "Edit"
                : "Preview"}
            </button>
          </div>

          {previewModes.options[`q${qIndex}_o${oIndex}`] ? (
            <div className="min-h-[44px] p-3 border border-slate-300 rounded-lg bg-white">
              <MarkdownPreview
                content={opt.value || "*No option text*"}
                className="text-sm text-slate-800"
              />
            </div>
          ) : (
            <textarea
              placeholder={`Option ${oIndex + 1} (Markdown supported)...\nExample: $x = \\pm 2$\nor\n**Correct because:** $2^2 - 4 = 0$`}
              value={opt.value}
              onChange={(e) =>
                handleOptionChange(qIndex, oIndex, "value", e.target.value)
              }
              className="w-full h-24 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
              rows={3}
            />
          )}
        </div>

        {/* Option Image Upload */}
        <div className="flex gap-2">
          <label className="flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg cursor-pointer hover:bg-slate-200 transition-colors text-sm">
            <ImageIcon size={14} />
            {opt.optionImage ? "Change" : "Image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                handleOptionImageUpload(qIndex, oIndex, e.target.files[0])
              }
            />
          </label>

          {opt.optionImageUrl && (
            <button
              type="button"
              onClick={() => removeOptionImage(qIndex, oIndex)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              title="Remove image"
            >
              <XCircle size={14} />
            </button>
          )}

          {q.options.length > 2 && (
            <button
              type="button"
              onClick={() => removeOption(qIndex, oIndex)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              title="Remove option"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Option Image Preview */}
      {opt.optionImageUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="ml-8"
        >
          <div className="relative inline-block">
            <img
              src={opt.optionImageUrl}
              alt={`Option ${oIndex + 1} preview`}
              className="max-h-32 rounded-lg border border-slate-300"
            />
            <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
              Option {oIndex + 1}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];

      if (!q.question.trim() && !q.questionImage) {
        toast.error(
          `Please enter a question or add an image for Question ${i + 1}`,
        );
        setActiveQuestion(i);
        return;
      }

      // Validate based on question type
      if (q.questionType === "text") {
        if (!q.correctAnswer.trim()) {
          toast.error(`Please enter correct answer(s) for Question ${i + 1}`);
          setActiveQuestion(i);
          return;
        }
      } else {
        // Validate MCQ options
        for (let j = 0; j < q.options.length; j++) {
          const opt = q.options[j];
          if (!opt.value.trim() && !opt.optionImage) {
            toast.error(
              `Please fill all options (text or image) for Question ${i + 1}`,
            );
            setActiveQuestion(i);
            return;
          }
        }

        if (q.questionType === "single") {
          if (q.correctAnswer === "" || q.correctAnswer === null) {
            toast.error(`Please select a correct answer for Question ${i + 1}`);
            setActiveQuestion(i);
            return;
          }
        } else {
          if (!Array.isArray(q.correctAnswer) || q.correctAnswer.length === 0) {
            toast.error(
              `Please select at least one correct answer for Question ${i + 1}`,
            );
            setActiveQuestion(i);
            return;
          }
        }
      }
    }

    try {
      const formData = new FormData();

      // Add pageId to formData
      formData.append("pageId", pageId);
      formData.append("chapterId", id);

      // Add questions data
      quiz.questions.forEach((q, qIndex) => {
        formData.append(`questions[${qIndex}][question]`, q.question);
        formData.append(`questions[${qIndex}][questionType]`, q.questionType);

        // Add hint if exists
        if (q.hint) {
          formData.append(`questions[${qIndex}][hint]`, q.hint);
        }

        if (q.questionType === "text") {
          // For text questions
          formData.append(
            `questions[${qIndex}][correctAnswer]`,
            q.correctAnswer,
          );
        } else {
          // For MCQ questions
          q.options.forEach((opt, oIndex) => {
            formData.append(
              `questions[${qIndex}][options][${oIndex}][value]`,
              opt.value,
            );
          });

          if (q.questionType === "single") {
            formData.append(
              `questions[${qIndex}][correctAnswer]`,
              q.correctAnswer,
            );
          } else {
            q.correctAnswer.forEach((ans, idx) => {
              formData.append(
                `questions[${qIndex}][correctAnswers][${idx}]`,
                ans,
              );
            });
          }
        }
      });

      // Add all images WITH INDEX
      quiz.questions.forEach((q, qIndex) => {
        if (q.questionImage) {
          formData.append(
            `questions[${qIndex}][questionImage]`,
            q.questionImage,
          );
        }

        // Only add option images for MCQ questions
        if (q.questionType !== "text") {
          q.options.forEach((opt, oIndex) => {
            if (opt.optionImage) {
              formData.append(
                `questions[${qIndex}][options][${oIndex}][optionImage]`,
                opt.optionImage,
              );
            }
          });
        }
      });

      await insertQuiz(formData).unwrap();

      toast.success("Quiz created successfully!");

      // Reset form - keep pageId but reset questions
      setQuiz({
        ...quiz,
        questions: [
          {
            id: Date.now(),
            question: "",
            questionImage: null,
            questionImageUrl: "",
            questionType: "single",
            options: defaultOptions(),
            correctAnswer: "",
            hint: "",
          },
        ],
      });

      setActiveQuestion(0);
    } catch (err) {
      console.error("Failed to save quiz:", err);
      toast.error(`Failed to save quiz: ${err?.data?.message || err.message}`, {
        autoClose: 5000,
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-xl shadow-lg mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Create Quiz for Page</h1>
              <p className="text-indigo-100">
                Page ID: {id} - Add questions to this page
              </p>
            </div>
          </div>
          <div className="bg-white/20 p-2 rounded-lg">
            <Settings className="h-6 w-6" />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Questions Navigation */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Questions</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              Question {activeQuestion + 1} of {quiz.questions.length}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setActiveQuestion(Math.max(0, activeQuestion - 1))
                }
                disabled={activeQuestion === 0}
                className={`p-2 rounded-lg ${
                  activeQuestion === 0
                    ? "bg-slate-100 text-slate-400"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                <ChevronUp className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveQuestion(
                    Math.min(quiz.questions.length - 1, activeQuestion + 1),
                  )
                }
                disabled={activeQuestion === quiz.questions.length - 1}
                className={`p-2 rounded-lg ${
                  activeQuestion === quiz.questions.length - 1
                    ? "bg-slate-100 text-slate-400"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-4">
          {quiz.questions.map((q, qIndex) => (
            <motion.div
              key={q.id}
              id={`question-${qIndex}`}
              className={`border rounded-xl p-5 transition-all duration-300 ${
                activeQuestion === qIndex
                  ? "border-indigo-500 bg-indigo-50 shadow-md"
                  : "border-slate-200 bg-white"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-500 text-white rounded-lg w-8 h-8 flex items-center justify-center">
                    {qIndex + 1}
                  </div>
                  <h3 className="font-semibold text-lg text-slate-800">
                    Question {qIndex + 1}
                  </h3>
                </div>

                <div className="flex gap-3">
                  <select
                    value={q.questionType}
                    onChange={(e) =>
                      handleQuestionChange(
                        qIndex,
                        "questionType",
                        e.target.value,
                      )
                    }
                    className="border border-slate-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="single">Single Choice</option>
                    <option value="multiple">Multiple Choice</option>
                    <option value="text">Typed Answer</option>
                  </select>

                  {quiz.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                      title="Delete question"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Question Input */}
              {renderQuestionInput(q, qIndex)}

              {/* Options Section - Only show for MCQ */}
              {q.questionType !== "text" && (
                <div className="space-y-3 mb-5">
                  <label className="block font-medium text-slate-700 mb-2">
                    Options{" "}
                    {q.questionType === "multiple"
                      ? "(Select multiple)"
                      : "(Select one)"}
                    <span className="text-sm text-slate-500 ml-2">
                      Click on the circle to mark as correct
                    </span>
                  </label>

                  {q.options.map((opt, oIndex) =>
                    renderOptionInput(q, qIndex, opt, oIndex),
                  )}
                </div>
              )}

              {/* Text Answer Section - Only show for Text Type */}
              {q.questionType === "text" && (
                <div className="space-y-3 mb-5">
                  <label className="block font-medium text-slate-700 mb-2">
                    Correct Answer (Text)
                  </label>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-slate-600">
                          {previewModes.correctAnswers?.[`q${qIndex}`]
                            ? "Preview"
                            : "Edit"}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewModes((prev) => ({
                              ...prev,
                              correctAnswers: {
                                ...prev.correctAnswers,
                                [`q${qIndex}`]:
                                  !prev.correctAnswers?.[`q${qIndex}`],
                              },
                            }));
                          }}
                          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
                        >
                          {previewModes.correctAnswers?.[`q${qIndex}`] ? (
                            <>
                              <EyeOff size={14} />
                              Edit
                            </>
                          ) : (
                            <>
                              <Eye size={14} />
                              Preview
                            </>
                          )}
                        </button>
                      </div>

                      {previewModes.correctAnswers?.[`q${qIndex}`] ? (
                        <div className="min-h-[60px] p-3 border border-slate-300 rounded-lg bg-white">
                          <MarkdownPreview
                            content={q.correctAnswer || "*No answer entered*"}
                            className="text-slate-800"
                          />
                        </div>
                      ) : (
                        <textarea
                          placeholder="Enter the correct answer(s) that students should type...
You can add multiple acceptable answers separated by commas:
Example: 4, four, Four, FOUR"
                          value={q.correctAnswer}
                          onChange={(e) =>
                            handleQuestionChange(
                              qIndex,
                              "correctAnswer",
                              e.target.value,
                            )
                          }
                          className="w-full h-32 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                          rows={3}
                        />
                      )}
                    </div>

                    <div className="text-sm text-slate-600 w-48">
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <strong>💡 Tip:</strong>
                        <ul className="mt-1 space-y-1">
                          <li>• Separate multiple answers with commas</li>
                          <li>• Answers are case-insensitive</li>
                          <li>• Extra spaces are ignored</li>
                          <li>• Supports markdown formatting</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Hint Input for Text Questions */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Hint (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Provide a hint to help students..."
                      value={q.hint || ""}
                      onChange={(e) =>
                        handleQuestionChange(qIndex, "hint", e.target.value)
                      }
                      className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      This hint will be shown to students if they need help
                      answering
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 mt-2">
                    Students will type their answer in a text input. The system
                    will automatically check if their answer matches any of the
                    acceptable answers listed above.
                  </p>
                </div>
              )}

              <div className="flex justify-between">
                {/* Show Add Option only for MCQ questions */}
                {q.questionType !== "text" && (
                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    className="flex items-center gap-1 text-indigo-600 font-medium hover:text-indigo-800"
                  >
                    <Plus size={16} />
                    Add Option
                  </button>
                )}

                <div className="text-sm text-slate-500">
                  {q.questionType === "text"
                    ? "Typed Answer"
                    : `${q.options.length} options • ${q.questionType === "single" ? "Single" : "Multiple"} Choice`}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-100 text-indigo-700 font-medium rounded-lg hover:bg-indigo-200 transition-colors"
          >
            <Plus size={18} />
            Add Question
          </button>

          <div className="flex-1" />

          <button
            type="submit"
            disabled={isLoading || uploadingImage}
            className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md disabled:opacity-70 flex items-center justify-center"
          >
            {isLoading || uploadingImage ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {uploadingImage ? "Uploading Images..." : "Creating Quiz..."}
              </>
            ) : (
              "Create Quiz"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EachChapterRelatedQuiz;
