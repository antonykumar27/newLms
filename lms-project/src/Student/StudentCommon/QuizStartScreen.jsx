import React from "react";
import {
  GraduationCap,
  BookOpen,
  Star,
  Clock,
  Target,
  User,
  AlertCircle,
  Award as MedalIcon,
} from "lucide-react";

const QuizStartScreen = ({
  quizInfo,
  questions,
  user,
  onStartQuiz,
  onShowContent,
  getDifficultyColor,
}) => {
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
              <h3 className="font-semibold text-slate-800">Class & Subject</h3>
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
              <h3 className="font-semibold text-slate-800">Chapter Details</h3>
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
              <h3 className="font-semibold text-slate-800">Time & Language</h3>
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
              <h3 className="font-semibold text-slate-800">Passing Criteria</h3>
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
                  {Math.ceil((quizInfo.passingScore / 100) * questions.length)}
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
                    <span className="font-semibold"> Multiple Choice</span>, and
                    <span className="font-semibold"> Typed Answer</span>
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    For typed answer questions, type your answer in the text box
                    provided
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
            onClick={onStartQuiz}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-lg transition-all transform hover:scale-105 flex items-center"
          >
            <MedalIcon className="h-5 w-5 mr-2" />
            Start Quiz Now
          </button>
          <button
            onClick={onShowContent}
            className="px-8 py-3 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-colors"
          >
            Back to Content
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizStartScreen;
