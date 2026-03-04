import React from "react";
import { Award, BarChart, CheckCircle, XCircle } from "lucide-react";
import CustomMarkdownRenderer from "./CustomMarkdownRenderer";

const QuizResultsScreen = ({
  quizResults,
  quizInfo,
  onComplete,
  onReset,
  formatTime,
}) => {
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
            onClick={onReset}
            className="px-6 py-3 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-colors"
          >
            Back to Content
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResultsScreen;
