import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Type,
  CheckSquare,
  Circle,
} from "lucide-react";
import CustomMarkdownRenderer from "./CustomMarkdownRenderer";
import QuestionMediaDisplay from "./QuestionMediaDisplay";
import OptionMediaDisplay from "./OptionMediaDisplay";

const ActiveQuizInterface = ({
  questions,
  currentQuestion,
  selectedOptions,
  textAnswers,
  timeLeft,
  showExplanation,
  quizInfo,
  onOptionSelect,
  onTextAnswerChange,
  onNext,
  onPrev,
  onSubmit,
  onQuestionSelect,
  onToggleExplanation,
  getQuestionStatus,
  getDifficultyColor,
  formatTime,
}) => {
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
                  onQuestionSelect(index);
                  onToggleExplanation(false);
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
                onClick={onToggleExplanation}
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
                  onTextAnswerChange(currentQuestion, e.target.value)
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
                      onClick={() => onOptionSelect(index)}
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
          onClick={onPrev}
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
            onClick={onNext}
            className="flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Next
            <ChevronRight className="h-5 w-5 ml-1" />
          </button>
        ) : (
          <button
            onClick={onSubmit}
            className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-md transition-all transform hover:scale-105"
          >
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default ActiveQuizInterface;
