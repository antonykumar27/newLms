import React from "react";
import {
  BookOpen,
  Layers,
  Target,
  Brain,
  ChevronLeft,
  ChevronRight,
  FileText,
  List,
  Image as ImageIcon,
  CheckCircle,
  Type,
  AlertCircle,
} from "lucide-react";
import CustomMarkdownRenderer from "./CustomMarkdownRenderer";
import QuestionMediaDisplay from "./QuestionMediaDisplay";
import OptionMediaDisplay from "./OptionMediaDisplay";

const ContentPreview = ({
  pages,
  currentPage,
  setCurrentPage,
  quizInfo,
  questions,
  onStartQuiz,
  onCancel,
  chapterNumber,
  chapterTitle,
  standard,
  subjectName,
}) => {
  const currentPageData = pages[currentPage];
  const isChapterQuiz = chapterTitle && chapterNumber != null;
  const isSubjectQuiz = subjectName && !isChapterQuiz;
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
                  <div className="flex items-center gap-2 text-slate-600">
                    {/* ✅ Subject Quiz */}
                    {isSubjectQuiz && (
                      <>
                        <span className="flex items-center gap-1">
                          <Layers className="h-4 w-4" />
                          Standard : {standard}
                        </span>

                        <span>•</span>

                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          Subject : {subjectName}
                        </span>
                      </>
                    )}

                    {/* ✅ Chapter Quiz */}
                    {isChapterQuiz && (
                      <>
                        <span className="flex items-center gap-1">
                          <Layers className="h-4 w-4" />
                          Chapter No : {chapterNumber}
                        </span>
                      </>
                    )}

                    {/* ✅ Always Show Questions Count */}
                    {questions?.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Brain className="h-4 w-4" />
                          {questions.length} Questions
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onStartQuiz}
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
                      {currentPageData?.title || `Question ${currentPage + 1}`}
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
                    className={`p-2 rounded-lg ${
                      currentPage === 0
                        ? "text-slate-400"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
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
                    className={`p-2 rounded-lg ${
                      currentPage === pages.length - 1
                        ? "text-slate-400"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
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
                                Array.isArray(currentPageData.correctAnswer) &&
                                currentPageData.correctAnswer.includes(index))
                                ? "border-green-500 bg-green-50"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                <div
                                  className={`${
                                    currentPageData.questionType === "multiple"
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
                                  {currentPageData.questionType === "single" &&
                                    currentPageData.correctAnswer === index && (
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
};

export default ContentPreview;
