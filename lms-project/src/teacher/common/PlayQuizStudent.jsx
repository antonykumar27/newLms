import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";

// Import your actual quiz API
import {
  useStoreResultMutation,
  useGetQuestionsByPageIdQuery,
  useGetChapterByIdQuery,
  useGetSubjectsByIdQuery,
} from "../../store/api/QuizApi";
import { useAuth } from "../../common/AuthContext";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Award,
  BarChart,
  Target,
  User,
  GraduationCap,
  Star,
  Award as MedalIcon,
  FileText,
  Image as ImageIcon,
  Brain,
  Layers,
  List,
  Type,
  CheckSquare,
  Circle,
} from "lucide-react";
import { useParams, useLocation } from "react-router-dom";

// Custom Markdown renderer for images
const CustomMarkdownRenderer = ({ content }) => {
  if (!content) return null;

  // If content starts with # (markdown heading), remove it for cleaner display
  const processedContent =
    typeof content === "string" ? content.replace(/^#\s*/, "") : content;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        img({ src, alt }) {
          const imageUrl = src?.startsWith("http")
            ? src
            : `${process.env.REACT_APP_API_URL || ""}${src}`;
          return (
            <div className="my-4">
              <img
                src={imageUrl}
                alt={alt || "Content image"}
                className="max-w-full h-auto rounded-lg border border-slate-200 shadow-sm"
                loading="lazy"
              />
              {alt && (
                <p className="text-sm text-slate-500 text-center mt-2">{alt}</p>
              )}
            </div>
          );
        },
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold text-slate-800 mt-6 mb-4">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-bold text-slate-800 mt-5 mb-3">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-base font-semibold text-slate-700 mt-3 mb-2">
            {children}
          </h4>
        ),
        h5: ({ children }) => (
          <h5 className="text-sm font-medium text-slate-700 mt-2 mb-1">
            {children}
          </h5>
        ),
        h6: ({ children }) => (
          <h6 className="text-xs font-medium text-slate-600 mt-2 mb-1">
            {children}
          </h6>
        ),
        p: ({ children }) => (
          <p className="text-slate-700 mb-3 leading-relaxed">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-slate-700 mb-1">{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-indigo-500 pl-4 py-2 my-3 italic text-slate-600 bg-indigo-50 rounded-r">
            {children}
          </blockquote>
        ),
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};

// Question Media Display Component
const QuestionMediaDisplay = ({
  questionImageUrl,
  title = "Question Image",
}) => {
  if (!questionImageUrl || !questionImageUrl.url) return null;

  return (
    <div className="mt-4 mb-6">
      <div className="relative group">
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <img
            src={questionImageUrl.url}
            alt={title}
            className="w-full h-auto max-h-[350px] object-contain"
            loading="lazy"
          />
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <ImageIcon size={10} />
            {title}
          </div>
        </div>
      </div>
    </div>
  );
};

// Option Media Display Component
const OptionMediaDisplay = ({ optionImageUrl, optionIndex }) => {
  if (!optionImageUrl || !optionImageUrl.url) return null;

  return (
    <div className="ml-8 mt-2">
      <div className="relative inline-block">
        <img
          src={optionImageUrl.url}
          alt={`Option ${optionIndex + 1} Image`}
          className="max-h-40 rounded-lg border border-slate-300"
          loading="lazy"
        />
        <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <ImageIcon size={10} />
          Option {optionIndex + 1}
        </div>
      </div>
    </div>
  );
};

const PlayQuizStudent = ({ quizId, onComplete, onCancel }) => {
  const { id } = useParams();
  console.log("issssssssss", id);
  const { state } = useLocation();

  const chapterId = state?.chapterId;
  const subjectId = state?.subjectId?.id;

  const subjectQuery = useGetSubjectsByIdQuery(subjectId, {
    skip: !subjectId,
  });

  const chapterQuery = useGetChapterByIdQuery(chapterId, {
    skip: !!subjectId || !chapterId,
  });

  const pageQuery = useGetQuestionsByPageIdQuery(id, {
    skip: !!subjectId || !!chapterId,
  });

  let activeQuery;
  let quizType;
  let quizCategory;
  if (subjectId) {
    activeQuery = subjectQuery;
    quizType = subjectId;
    quizCategory = "SUBJECT";
  } else if (chapterId) {
    activeQuery = chapterQuery;
    quizType = chapterId;
    quizCategory = "CHAPTER";
  } else {
    activeQuery = pageQuery;
    quizType = id;
    quizCategory = "PAGE";
  }

  const {
    data: quizData,
    isLoading: quizLoading,
    isError: quizError,
    refetch,
  } = activeQuery;
  console.log("quizData", quizData);
  console.log("quizError", quizError);
  const [storeResult] = useStoreResultMutation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [textAnswers, setTextAnswers] = useState({}); // New state for text answers
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [showContent, setShowContent] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const { user } = useAuth();

  // Process quiz data with new structure
  const { questions, quizInfo } = useMemo(() => {
    if (!quizData || !quizData.success) return { questions: [], quizInfo: {} };

    const data = quizData?.data || [];

    if (Array.isArray(data)) {
      const processedQuestions = data.map((item, index) => {
        // Handle TEXT questions differently
        if (item.questionType === "TEXT") {
          return {
            id: item._id || `question-${index}`,
            question: item.question || "",
            explanation: item.explanation || "",
            options: [], // No options for TEXT questions
            optionMedia: [], // No option media for TEXT
            correctAnswer: item.correctAnswer || "", // Store the text answer
            marks: item.marks || 1,
            questionType: "text", // lowercase for frontend
            questionMedia: item.questionImageUrl,
            media: item.media || [],
            hints: item.hints || [],
            difficulty: item.difficulty || "Medium",
            createdAt: item.createdAt,
            standard: item.standard || "9th",
            subject: item.subject || "Science",
            chapter: item.chapter || "General",
            topic: item.topic || "General Quiz",
            language: item.language || "Malayalam",
          };
        }

        // Handle MCQ questions (MCQ_SINGLE or MCQ_MULTIPLE)
        const processedOptions = (item.options || []).map((option) => {
          return {
            text: option.value || "", // Option text from 'value' field
            media: option.optionImageUrl, // Option media from 'optionImageUrl'
          };
        });

        // Find correct answer based on questionType
        let correctAnswer;
        const correctAnswerText =
          item.correctAnswer?.replace(/^#\s*/, "") || "";

        if (item.questionType === "MCQ_SINGLE") {
          // Single choice: correctAnswer is option value
          const correctAnswerIndex = processedOptions.findIndex(
            (opt) => opt.text.replace(/^#\s*/, "") === correctAnswerText,
          );
          correctAnswer = correctAnswerIndex >= 0 ? correctAnswerIndex : 0;
        } else if (item.questionType === "MCQ_MULTIPLE") {
          // Multiple choice: correctAnswer is array of indices (stored as JSON string)
          try {
            const indices = JSON.parse(correctAnswerText);
            correctAnswer = Array.isArray(indices) ? indices : [];
          } catch {
            correctAnswer = [];
          }
        } else {
          // Default to single choice for legacy MCQ
          const correctAnswerIndex = processedOptions.findIndex(
            (opt) => opt.text.replace(/^#\s*/, "") === correctAnswerText,
          );
          correctAnswer = correctAnswerIndex >= 0 ? correctAnswerIndex : 0;
        }

        return {
          id: item._id || `question-${index}`,
          question: item.question || "",
          explanation: item.explanation || "",
          options: processedOptions.map((opt) => opt.text), // Just the text for display
          optionMedia: processedOptions.map((opt) => opt.media), // Separate media array
          correctAnswer: correctAnswer,
          marks: item.marks || 1,
          questionType:
            item.questionType === "MCQ_MULTIPLE" ? "multiple" : "single",
          questionMedia: item.questionImageUrl,
          media: item.media || [],
          hints: item.hints || [],
          difficulty: item.difficulty || "Medium",
          createdAt: item.createdAt,
          standard: item.standard || "9th",
          subject: item.subject || "Science",
          chapter: item.chapter || "General",
          topic: item.topic || "General Quiz",
          language: item.language || "Malayalam",
        };
      });

      // Calculate total marks
      const totalMarks = processedQuestions.reduce(
        (sum, q) => sum + (q.marks || 1),
        0,
      );

      return {
        questions: processedQuestions,
        quizInfo: {
          _id: quizId || id,
          quizTitle: data[0]?.topic || `Quiz for Chapter ${id}`,
          description: "Quiz based on the chapter content",
          duration: 1800,
          totalMarks: totalMarks,
          passingScore: 70,
          difficulty: data[0]?.difficulty || "Medium",
          standard: data[0]?.standard || "10th",
          subject: data[0]?.subject || "Science",
          chapter: data[0]?.chapter || `Chapter ${id}`,
          chapterNumber: data[0]?.chapterNumber || id,
          topic: data[0]?.topic || "Quiz",
          language: data[0]?.language || "Malayalam",
        },
      };
    }

    return {
      questions: [],
      quizInfo: {},
    };
  }, [quizData, quizId, id]);

  // Create pages from questions for content view
  const pages = useMemo(() => {
    return questions.map((q, index) => ({
      _id: q.id || index,
      title: q.question
        ? q.question.replace(/^#\s*/, "").split("\n")[0]
        : `Question ${index + 1}`,
      pageNumber: index + 1,
      updatedAt: q.createdAt,
      content: q.question || "",
      explanation: q.explanation || "",
      questionMedia: q.questionMedia,
      media: q.media || [],
      options: q.options || [],
      optionMedia: q.optionMedia || [],
      correctAnswer: q.correctAnswer,
      marks: q.marks || 1,
      questionType: q.questionType,
      originalQuestion: q,
    }));
  }, [questions]);

  // Get current page data
  const currentPageData = pages[currentPage];

  // Initialize timer when quiz starts
  useEffect(() => {
    if (!quizStarted || quizCompleted) return;

    const totalTime = quizInfo.duration || 1800;
    setTimeLeft(totalTime);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, quizCompleted, quizInfo]);

  const handleOptionSelect = (optionIndex) => {
    const question = questions[currentQuestion];

    if (!question) return;

    if (question.questionType === "single") {
      setSelectedOptions({
        ...selectedOptions,
        [currentQuestion]: [optionIndex],
      });
    } else if (question.questionType === "multiple") {
      const currentSelections = selectedOptions[currentQuestion] || [];
      const newSelections = currentSelections.includes(optionIndex)
        ? currentSelections.filter((idx) => idx !== optionIndex)
        : [...currentSelections, optionIndex];

      setSelectedOptions({
        ...selectedOptions,
        [currentQuestion]: newSelections,
      });
    }

    setShowExplanation(false);
  };

  const handleTextAnswerChange = (questionIndex, answer) => {
    setTextAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));

    // Also update selectedOptions for consistency
    setSelectedOptions({
      ...selectedOptions,
      [questionIndex]: [answer], // Store as array for consistency
    });

    setShowExplanation(false);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowExplanation(false);
    }
  };

  const handleAutoSubmit = async () => {
    await calculateAndSubmitResults();
  };

  const calculateAndSubmitResults = async () => {
    if (quizCompleted || questions.length === 0) return;

    let correctAnswers = 0;
    let totalMarksObtained = 0;
    let detailedResults = [];

    questions.forEach((question, index) => {
      const selectedIndices = selectedOptions[index] || [];
      const textAnswer = textAnswers[index] || "";
      let isCorrect = false;
      let userAnswerDisplay = "";

      if (question.questionType === "text") {
        // Handle TEXT question
        userAnswerDisplay = textAnswer;

        // Check for multiple correct answers (comma-separated)
        const correctAnswersList = question.correctAnswer
          ? question.correctAnswer
              .split(",")
              .map((ans) => ans.trim().toLowerCase())
          : [];

        isCorrect = correctAnswersList.includes(
          textAnswer.trim().toLowerCase(),
        );
      } else if (question.questionType === "single") {
        // Single choice MCQ
        userAnswerDisplay =
          selectedIndices.length > 0
            ? question.options[selectedIndices[0]]
            : "Not answered";
        isCorrect =
          selectedIndices.length === 1 &&
          selectedIndices[0] === question.correctAnswer;
      } else {
        // Multiple choice MCQ
        userAnswerDisplay = selectedIndices
          .map((idx) => question.options[idx])
          .join(", ");

        // Check if arrays match (order doesn't matter)
        const selectedSet = new Set(selectedIndices);
        const correctSet = new Set(question.correctAnswer || []);
        isCorrect =
          selectedIndices.length === (question.correctAnswer?.length || 0) &&
          selectedIndices.every((idx) => correctSet.has(idx)) &&
          question.correctAnswer.every((idx) => selectedSet.has(idx));
      }

      if (isCorrect) {
        correctAnswers++;
        totalMarksObtained += question.marks || 1;
      }

      detailedResults.push({
        question: question.question,
        userAnswer: userAnswerDisplay,
        correctAnswer:
          question.questionType === "text"
            ? question.correctAnswer
            : question.questionType === "single"
              ? [question.options[question.correctAnswer]]
              : (question.correctAnswer || []).map(
                  (idx) => question.options[idx],
                ),
        isCorrect,
        explanation: question.explanation,
        marks: question.marks || 1,
        marksObtained: isCorrect ? question.marks || 1 : 0,
        questionMedia: question.questionMedia,
        optionMedia: question.optionMedia,
        questionType: question.questionType,
      });
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const timeTaken = (quizInfo.duration || 1800) - timeLeft;

    const results = {
      quizId: quizInfo._id,
      quizTitle: quizInfo.quizTitle,
      score,
      correctAnswers,
      totalQuestions: questions.length,
      totalMarks: quizInfo.totalMarks,
      marksObtained: totalMarksObtained,
      timeTaken,
      standard: quizInfo.standard,
      subject: quizInfo.subject,
      chapter: quizInfo.chapter,
      chapterNumber: quizInfo.chapterNumber,
      topic: quizInfo.topic,
      difficulty: quizInfo.difficulty,
      language: quizInfo.language,
      detailedResults,
    };

    setQuizResults(results);
    setQuizCompleted(true);

    // Store result in database
    try {
      if (user) {
        await storeResult({
          quizId: quizInfo._id,
          quizType,
          quizCategory,
          quizTitle: quizInfo.quizTitle,
          score,
          correctAnswers,
          totalQuestions: questions.length,
          totalMarks: quizInfo.totalMarks,
          marksObtained: totalMarksObtained,
          timeTaken,
          standard: quizInfo.standard,

          date: new Date().toISOString(),
        }).unwrap();
      }
    } catch (err) {
      console.error("Failed to store result:", err);
    }

    if (onComplete) onComplete(results);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const getQuestionStatus = (index) => {
    const question = questions[index];
    if (!question) return "unanswered";

    if (question.questionType === "text") {
      return textAnswers[index] ? "answered" : "unanswered";
    } else {
      const selected = selectedOptions[index];
      return selected && selected.length > 0 ? "answered" : "unanswered";
    }
  };

  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return "text-gray-600 bg-gray-100";

    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "hard":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case "text":
        return <Type className="h-4 w-4" />;
      case "multiple":
        return <CheckSquare className="h-4 w-4" />;
      case "single":
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  // Loading state
  if (quizLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="relative">
          <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-indigo-500 mb-6"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-indigo-500" />
          </div>
        </div>
        <p className="text-slate-600 text-lg font-medium">
          Loading your quiz...
        </p>
        <p className="text-slate-500 text-sm mt-2">
          Preparing questions and content
        </p>
      </div>
    );
  }

  // Error state
  if (quizError || !quizData) {
    return (
      <div className="max-w-2xl mx-auto bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-8 text-center mt-10">
        <div className="relative inline-block mb-4">
          <AlertCircle className="h-20 w-20 text-red-500 mx-auto" />
          <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg">
            <BookOpen className="h-6 w-6 text-red-400" />
          </div>
        </div>
        <div className="text-red-700 font-bold text-2xl mb-3">
          Quiz Unavailable
        </div>
        <p className="text-red-600 mb-6 text-lg">
          {quizError?.data?.message ||
            "Unable to load the quiz. Please try again later."}
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-md flex items-center"
          >
            Retry Loading
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // No questions state
  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          No Questions Available
        </h2>
        <p className="text-slate-600 mb-6">
          This quiz doesn't contain any questions yet.
        </p>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Content View (Before Quiz Starts)
  if (!quizStarted && showContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <BookOpen className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                      {quizInfo.chapter || "Quiz Preparation"}
                    </h1>
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="flex items-center gap-1">
                        <Layers className="h-4 w-4" />
                        Chapter {quizInfo.chapterNumber}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {quizInfo.subject}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Brain className="h-4 w-4" />
                        {questions.length} Questions
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowContent(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-md transition-all flex items-center gap-2"
                >
                  <Brain className="h-5 w-5" />
                  Start Quiz
                </button>
                <button
                  onClick={onCancel}
                  className="px-4 py-2.5 bg-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-300 transition-colors"
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
                {/* Page Navigation */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 p-3 rounded-xl">
                      <FileText className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">
                        {currentPageData?.title ||
                          `Question ${currentPage + 1}`}
                      </h2>
                      <p className="text-slate-600">
                        Question {currentPage + 1} of {pages.length}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(0, prev - 1))
                      }
                      disabled={currentPage === 0}
                      className={`p-2 rounded-lg ${currentPage === 0 ? "text-slate-400" : "text-slate-700 hover:bg-slate-100"}`}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-700 font-medium">
                      {currentPage + 1}/{pages.length}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(pages.length - 1, prev + 1),
                        )
                      }
                      disabled={currentPage === pages.length - 1}
                      className={`p-2 rounded-lg ${currentPage === pages.length - 1 ? "text-slate-400" : "text-slate-700 hover:bg-slate-100"}`}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  {/* Display Question Media */}
                  {currentPageData?.questionMedia && (
                    <QuestionMediaDisplay
                      questionImageUrl={currentPageData.questionMedia}
                      title="Question Image"
                    />
                  )}

                  {/* Display Question Text */}
                  {currentPageData?.content ? (
                    <CustomMarkdownRenderer content={currentPageData.content} />
                  ) : (
                    <div className="text-center py-12">
                      <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">
                        No content available for this question.
                      </p>
                    </div>
                  )}

                  {/* Display Different Content Based on Question Type */}
                  {currentPageData?.questionType === "text" ? (
                    <div className="mt-8 pt-8 border-t border-slate-200">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                        <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                          <Type className="h-5 w-5" />
                          Typed Answer Question
                        </h4>
                        <p className="text-green-700 mb-3">
                          This is a typed answer question. Students will enter
                          their answer in a text box.
                        </p>
                        <div className="bg-white p-4 rounded-lg border border-green-300">
                          <p className="text-sm text-slate-600 mb-2">
                            Correct Answer:
                          </p>
                          <div className="prose prose-sm">
                            <CustomMarkdownRenderer
                              content={currentPageData.correctAnswer}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Show options for MCQ questions
                    currentPageData?.options &&
                    currentPageData.options.length > 0 && (
                      <div className="mt-8 pt-8 border-t border-slate-200">
                        <h4 className="font-semibold text-slate-800 mb-4">
                          Options
                        </h4>
                        <div className="space-y-3">
                          {currentPageData.options.map((option, index) => (
                            <div
                              key={index}
                              className={`p-4 rounded-lg border ${
                                (currentPageData.questionType === "single" &&
                                  currentPageData.correctAnswer === index) ||
                                (currentPageData.questionType === "multiple" &&
                                  Array.isArray(
                                    currentPageData.correctAnswer,
                                  ) &&
                                  currentPageData.correctAnswer.includes(index))
                                  ? "border-green-500 bg-green-50"
                                  : "border-slate-200 bg-white"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                  <div
                                    className={`${
                                      currentPageData.questionType ===
                                      "multiple"
                                        ? "w-6 h-6 rounded border flex items-center justify-center"
                                        : "w-6 h-6 rounded-full border-2 flex items-center justify-center"
                                    } ${
                                      (currentPageData.questionType ===
                                        "single" &&
                                        currentPageData.correctAnswer ===
                                          index) ||
                                      (currentPageData.questionType ===
                                        "multiple" &&
                                        Array.isArray(
                                          currentPageData.correctAnswer,
                                        ) &&
                                        currentPageData.correctAnswer.includes(
                                          index,
                                        ))
                                        ? "border-green-600 bg-green-600"
                                        : "border-slate-400"
                                    }`}
                                  >
                                    {currentPageData.questionType ===
                                      "single" &&
                                      currentPageData.correctAnswer ===
                                        index && (
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                      )}
                                    {currentPageData.questionType ===
                                      "multiple" &&
                                      Array.isArray(
                                        currentPageData.correctAnswer,
                                      ) &&
                                      currentPageData.correctAnswer.includes(
                                        index,
                                      ) && (
                                        <CheckCircle className="h-4 w-4 text-white" />
                                      )}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <CustomMarkdownRenderer content={option} />
                                </div>
                                <span className="text-xs text-slate-500 mt-1">
                                  {String.fromCharCode(65 + index)}
                                </span>
                              </div>

                              {/* Display Option Media in Preview */}
                              {currentPageData.optionMedia &&
                                currentPageData.optionMedia[index] && (
                                  <OptionMediaDisplay
                                    optionImageUrl={
                                      currentPageData.optionMedia[index]
                                    }
                                    optionIndex={index}
                                  />
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}

                  {/* Display Explanation */}
                  {currentPageData?.explanation && (
                    <div className="mt-8 pt-8 border-t border-slate-200">
                      <div className="bg-blue-50 rounded-xl p-5">
                        <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Explanation
                        </h4>
                        <CustomMarkdownRenderer
                          content={currentPageData.explanation}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Question List */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-28">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <List className="h-5 w-5" />
                  Questions List
                </h3>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {pages.map((page, index) => (
                    <button
                      key={page._id}
                      onClick={() => setCurrentPage(index)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        currentPage === index
                          ? "bg-indigo-50 border-2 border-indigo-200"
                          : "bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                              currentPage === index
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-slate-700 font-medium truncate max-w-[150px]">
                              {page.title}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded ${
                                  page.questionType === "text"
                                    ? "bg-green-100 text-green-800"
                                    : page.questionType === "multiple"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {page.questionType === "text"
                                  ? "Text"
                                  : page.questionType === "multiple"
                                    ? "Multiple"
                                    : "Single"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {page.questionMedia && (
                            <ImageIcon className="h-4 w-4 text-blue-500" />
                          )}
                          <span className="text-sm text-slate-500">
                            {page.marks} marks
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Interface - Start Screen
  if (!quizStarted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{quizInfo.quizTitle}</h1>
              <p className="text-indigo-100">
                Test your knowledge with this quiz
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(
                  quizInfo.difficulty,
                )}`}
              >
                {quizInfo.difficulty}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-b-2xl shadow-lg p-8">
          {/* Quiz Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-xl">
              <div className="flex items-center mb-2">
                <GraduationCap className="h-5 w-5 text-indigo-500 mr-2" />
                <h3 className="font-semibold text-slate-800">
                  Class & Subject
                </h3>
              </div>
              <div className="space-y-1">
                <p className="text-slate-600">
                  Standard:{" "}
                  <span className="font-semibold">{quizInfo.standard}</span>
                </p>
                <p className="text-slate-600">
                  Subject:{" "}
                  <span className="font-semibold">{quizInfo.subject}</span>
                </p>
              </div>
            </div>

            <div className="bg-indigo-50 p-4 rounded-xl">
              <div className="flex items-center mb-2">
                <BookOpen className="h-5 w-5 text-indigo-500 mr-2" />
                <h3 className="font-semibold text-slate-800">
                  Chapter Details
                </h3>
              </div>
              <div className="space-y-1">
                <p className="text-slate-600">
                  Chapter {quizInfo.chapterNumber}:{" "}
                  <span className="font-semibold">{quizInfo.chapter}</span>
                </p>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl">
              <div className="flex items-center mb-2">
                <Star className="h-5 w-5 text-purple-500 mr-2" />
                <h3 className="font-semibold text-slate-800">Quiz Info</h3>
              </div>
              <div className="space-y-1">
                <p className="text-slate-600">
                  Marks:{" "}
                  <span className="font-semibold">{quizInfo.totalMarks}</span>
                </p>
                <p className="text-slate-600">
                  Questions:{" "}
                  <span className="font-semibold">{questions.length}</span>
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="font-semibold text-slate-800">
                  Time & Language
                </h3>
              </div>
              <div className="space-y-1">
                <p className="text-slate-600">
                  Duration:{" "}
                  <span className="font-semibold">
                    {Math.round((quizInfo.duration || 1800) / 60)} minutes
                  </span>
                </p>
                <p className="text-slate-600">
                  Language:{" "}
                  <span className="font-semibold">{quizInfo.language}</span>
                </p>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-xl">
              <div className="flex items-center mb-2">
                <Target className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="font-semibold text-slate-800">
                  Passing Criteria
                </h3>
              </div>
              <div className="space-y-1">
                <p className="text-slate-600">
                  Passing Score:{" "}
                  <span className="font-semibold text-green-600">
                    {quizInfo.passingScore}%
                  </span>
                </p>
                <p className="text-slate-600">
                  Questions to Pass:{" "}
                  <span className="font-semibold">
                    {Math.ceil(
                      (quizInfo.passingScore / 100) * questions.length,
                    )}
                  </span>
                </p>
              </div>
            </div>

            {user && (
              <div className="bg-amber-50 p-4 rounded-xl">
                <div className="flex items-center mb-2">
                  <User className="h-5 w-5 text-amber-500 mr-2" />
                  <h3 className="font-semibold text-slate-800">Student Info</h3>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-600">
                    Name: <span className="font-semibold">{user.name}</span>
                  </p>
                  {user.email && (
                    <p className="text-slate-600 text-sm">
                      Email: <span className="font-semibold">{user.email}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-8">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">
                  Important Instructions
                </h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      This quiz contains different types of questions:
                      <span className="font-semibold"> Single Choice</span>,
                      <span className="font-semibold"> Multiple Choice</span>,
                      and
                      <span className="font-semibold"> Typed Answer</span>
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      For typed answer questions, type your answer in the text
                      box provided
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      Some questions may include images - look carefully at all
                      images before answering
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      Total time:{" "}
                      <strong>
                        {Math.round((quizInfo.duration || 1800) / 60)} minutes
                      </strong>
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      Minimum passing score:{" "}
                      <strong>{quizInfo.passingScore}%</strong>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Start Quiz Button */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setQuizStarted(true)}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-lg transition-all transform hover:scale-105 flex items-center"
            >
              <MedalIcon className="h-5 w-5 mr-2" />
              Start Quiz Now
            </button>
            <button
              onClick={() => setShowContent(true)}
              className="px-8 py-3 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-colors"
            >
              Back to Content
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Results
  if (quizCompleted && quizResults) {
    const isPassed = quizResults.score >= quizInfo.passingScore;

    return (
      <div className="max-w-4xl mx-auto">
        <div
          className={`rounded-t-2xl p-6 text-white ${
            isPassed
              ? "bg-gradient-to-r from-green-500 to-emerald-600"
              : "bg-gradient-to-r from-red-500 to-orange-600"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {isPassed ? "🎉 Quiz Passed!" : "📝 Quiz Completed"}
              </h1>
              <p className={isPassed ? "text-emerald-100" : "text-orange-100"}>
                {quizInfo.quizTitle}
              </p>
            </div>
            <Award className="h-12 w-12" />
          </div>
        </div>

        <div className="bg-white rounded-b-2xl shadow-lg p-8">
          {/* Results Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div
              className={`p-5 rounded-xl text-center ${
                isPassed ? "bg-emerald-50" : "bg-red-50"
              }`}
            >
              <div
                className="text-4xl font-bold mb-2"
                style={{ color: isPassed ? "#059669" : "#dc2626" }}
              >
                {quizResults.score}%
              </div>
              <p
                className="font-semibold"
                style={{ color: isPassed ? "#047857" : "#b91c1c" }}
              >
                Overall Score
              </p>
              <div className="mt-2 text-sm">
                {isPassed ? "✅ Passed" : "❌ Failed"}
              </div>
            </div>

            <div className="bg-blue-50 p-5 rounded-xl text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {quizResults.correctAnswers}/{quizResults.totalQuestions}
              </div>
              <p className="text-blue-700 font-semibold">Correct Answers</p>
            </div>

            <div className="bg-purple-50 p-5 rounded-xl text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {quizResults.marksObtained}/{quizResults.totalMarks}
              </div>
              <p className="text-purple-700 font-semibold">Marks Obtained</p>
            </div>

            <div className="bg-amber-50 p-5 rounded-xl text-center">
              <div className="text-4xl font-bold text-amber-600 mb-2">
                {formatTime(quizResults.timeTaken)}
              </div>
              <p className="text-amber-700 font-semibold">Time Taken</p>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <BarChart className="h-6 w-6 mr-2" />
              Detailed Results
            </h3>
            <div className="space-y-4">
              {quizResults.detailedResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.isCorrect
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-medium text-slate-800">
                      <span className="text-slate-600 mr-2">Q{index + 1}:</span>
                      <CustomMarkdownRenderer content={result.question} />
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-slate-600">
                        Marks: {result.marksObtained}/{result.marks}
                      </span>
                      {result.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          result.questionType === "text"
                            ? "bg-green-100 text-green-800"
                            : result.questionType === "multiple"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {result.questionType === "text"
                          ? "Text"
                          : result.questionType === "multiple"
                            ? "Multiple"
                            : "Single"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600 mb-1">Your Answer:</p>
                      <div className="prose prose-sm max-w-none">
                        {result.questionType === "text" ? (
                          <div
                            className={`p-2 rounded ${result.isCorrect ? "bg-green-100 border border-green-200" : "bg-red-100 border border-red-200"}`}
                          >
                            {result.userAnswer || "Not answered"}
                          </div>
                        ) : (
                          <CustomMarkdownRenderer
                            content={result.userAnswer || "Not answered"}
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-600 mb-1">Correct Answer:</p>
                      <div className="prose prose-sm max-w-none">
                        {result.questionType === "text" ? (
                          <div className="p-2 rounded bg-green-50 border border-green-200">
                            {result.correctAnswer}
                          </div>
                        ) : (
                          <CustomMarkdownRenderer
                            content={
                              Array.isArray(result.correctAnswer)
                                ? result.correctAnswer.join(", ")
                                : result.correctAnswer
                            }
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  {result.explanation && (
                    <div className="mt-3 p-3 bg-slate-100 rounded-lg">
                      <p className="text-slate-700 text-sm">
                        {result.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => onComplete(quizResults)}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              View in Dashboard
            </button>
            <button
              onClick={() => {
                setQuizStarted(false);
                setQuizCompleted(false);
                setCurrentQuestion(0);
                setSelectedOptions({});
                setTextAnswers({});
                setQuizResults(null);
                setShowContent(true);
              }}
              className="px-6 py-3 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-colors"
            >
              Back to Content
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz Interface
  const question = questions[currentQuestion];
  const selectedOptionIndices = selectedOptions[currentQuestion] || [];
  const currentTextAnswer = textAnswers[currentQuestion] || "";
  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  // Calculate answered questions
  const answeredQuestions = questions.reduce((count, q, index) => {
    if (q.questionType === "text") {
      return textAnswers[index] ? count + 1 : count;
    } else {
      return selectedOptions[index] && selectedOptions[index].length > 0
        ? count + 1
        : count;
    }
  }, 0);

  const questionMarks = question.marks || 1;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Quiz Header */}
      <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold truncate">
                {quizInfo.quizTitle}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-indigo-200 text-sm">
                  {quizInfo.subject} • Chapter {quizInfo.chapterNumber}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(
                    quizInfo.difficulty,
                  )}`}
                >
                  {quizInfo.difficulty}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <div className="flex items-center bg-white/20 px-3 py-1 rounded-lg">
                <Clock className="h-4 w-4 mr-1" />
                <span className="font-mono font-bold">
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="text-sm bg-white/10 px-3 py-1 rounded-lg">
                <span className="font-bold">
                  {answeredQuestions}/{questions.length}
                </span>
                <span className="text-indigo-200 ml-1">answered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress and Info Bar */}
        <div className="px-4 pt-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
            <div className="text-sm text-slate-600">
              Question {currentQuestion + 1} of {questions.length}
              <span className="ml-2 text-indigo-600 font-semibold">
                • Marks: {questionMarks}
              </span>
              <span className="ml-2 flex items-center gap-1">
                {getQuestionTypeIcon(question.questionType)}
                <span className="font-medium">
                  {question.questionType === "multiple"
                    ? "Multiple Choice"
                    : question.questionType === "text"
                      ? "Typed Answer"
                      : "Single Choice"}
                </span>
              </span>
            </div>
            <div className="text-sm text-slate-600">
              Total Marks: {quizInfo.totalMarks} • Language: {quizInfo.language}
            </div>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Question Navigation */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex flex-wrap gap-2">
            {questions.map((q, index) => (
              <button
                key={q.id || index}
                onClick={() => {
                  setCurrentQuestion(index);
                  setShowExplanation(false);
                }}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-all relative ${
                  currentQuestion === index
                    ? "bg-indigo-600 text-white ring-2 ring-indigo-300"
                    : getQuestionStatus(index) === "answered"
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                title={`Question ${index + 1} (${q.marks || 1} marks) - ${q.questionType === "text" ? "Typed Answer" : q.questionType === "multiple" ? "Multiple Choice" : "Single Choice"}`}
              >
                {index + 1}
                {q.marks > 1 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {q.marks}
                  </span>
                )}
                {q.questionMedia && (
                  <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    📷
                  </span>
                )}
                {q.questionType === "text" && (
                  <span className="absolute -top-1 -left-1 bg-green-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    T
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Question {currentQuestion + 1}
                </span>
                <span className="text-slate-600 text-sm">
                  Marks:{" "}
                  <span className="font-semibold text-indigo-600">
                    {questionMarks}
                  </span>
                </span>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${getDifficultyColor(
                    question.difficulty || quizInfo.difficulty,
                  )}`}
                >
                  {question.difficulty || quizInfo.difficulty}
                </span>
                {question.questionMedia && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1">
                    <ImageIcon size={10} />
                    Image Included
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-slate-600">Type:</span>
                <span
                  className={`font-medium ${
                    question.questionType === "multiple"
                      ? "text-purple-600"
                      : question.questionType === "text"
                        ? "text-green-600"
                        : "text-blue-600"
                  }`}
                >
                  {question.questionType === "multiple"
                    ? "Multiple Choice"
                    : question.questionType === "text"
                      ? "Typed Answer"
                      : "Single Choice"}
                </span>
              </div>
            </div>
            {question.explanation && (
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1 bg-indigo-50 rounded-lg"
              >
                {showExplanation ? "Hide Explanation" : "Show Explanation"}
              </button>
            )}
          </div>

          {/* Display Question Media */}
          {question.questionMedia && (
            <QuestionMediaDisplay
              questionImageUrl={question.questionMedia}
              title="Question Image"
            />
          )}

          {/* Question Content */}
          <div className="mb-6">
            <div className="prose max-w-none">
              <CustomMarkdownRenderer content={question.question} />
            </div>
          </div>

          {/* Options or Text Input based on question type */}
          {question.questionType === "text" ? (
            // TEXT QUESTION: Input field for answer
            <div className="mt-6 mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Type your answer:
              </label>
              <textarea
                value={currentTextAnswer}
                onChange={(e) =>
                  handleTextAnswerChange(currentQuestion, e.target.value)
                }
                placeholder="Type your answer here..."
                className="w-full h-32 border-2 border-slate-300 rounded-xl p-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                rows={4}
              />
              <p className="text-xs text-slate-500 mt-2">
                Your answer will be checked automatically against the correct
                answer.
              </p>
            </div>
          ) : (
            // MCQ QUESTION: Show options
            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedOptionIndices.includes(index);
                return (
                  <div key={index}>
                    <button
                      onClick={() => handleOptionSelect(index)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? question.questionType === "multiple"
                            ? "border-purple-500 bg-purple-50"
                            : "border-indigo-500 bg-indigo-50"
                          : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30"
                      }`}
                    >
                      <div className="flex items-start">
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 mt-1 ${
                            isSelected
                              ? question.questionType === "multiple"
                                ? "border-purple-600 bg-purple-600"
                                : "border-indigo-600 bg-indigo-600"
                              : "border-slate-300"
                          }`}
                        >
                          {isSelected && question.questionType === "single" && (
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          )}
                          {isSelected &&
                            question.questionType === "multiple" && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="prose prose-sm max-w-none">
                              <CustomMarkdownRenderer content={option} />
                            </div>
                            <span className="text-xs text-slate-500">
                              Option {String.fromCharCode(65 + index)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                    {/* Option Media Display */}
                    {question.optionMedia && question.optionMedia[index] && (
                      <OptionMediaDisplay
                        optionImageUrl={question.optionMedia[index]}
                        optionIndex={index}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Hints */}
          {question.hints && question.hints.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Hint
              </h4>
              <ul className="text-yellow-700 text-sm">
                {question.hints.map((hint, idx) => (
                  <li key={idx} className="mb-1">
                    {hint}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Explanation */}
          {showExplanation && question.explanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200"
            >
              <h4 className="font-semibold text-slate-700 mb-2 flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Explanation
              </h4>
              <div className="prose prose-sm max-w-none">
                <CustomMarkdownRenderer content={question.explanation} />
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrev}
          disabled={currentQuestion === 0}
          className={`flex items-center px-5 py-2.5 rounded-lg transition-colors ${
            currentQuestion === 0
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Previous
        </button>

        <div className="text-center">
          <div className="text-sm text-slate-600">
            Question {currentQuestion + 1} of {questions.length}
          </div>
          <div className="text-xs text-slate-500">
            Marks for this question: {questionMarks}
          </div>
        </div>

        {currentQuestion < questions.length - 1 ? (
          <button
            onClick={handleNext}
            className="flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Next
            <ChevronRight className="h-5 w-5 ml-1" />
          </button>
        ) : (
          <button
            onClick={calculateAndSubmitResults}
            className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-md transition-all transform hover:scale-105"
          >
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default PlayQuizStudent;
