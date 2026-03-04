import React, { useState, useEffect } from "react";
import {
  UsersIcon,
  ChartBarIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  BellIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import {
  useGetAllChaptersQuery,
  useGetQuestionsQuery,
  useGetResultQuery,
  useCreateChapterMutation,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
} from "../store/api/QuizManagementApi";

import EmptyState from "./EmptyState";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminDashBoard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState("chapter"); // chapter, question, user
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // API Hooks
  const { data: chaptersData, refetch: refetchChapters } =
    useGetAllChaptersQuery({});
  const { data: questionsData, refetch: refetchQuestions } =
    useGetQuestionsQuery({});
  const { data: resultsData, refetch: refetchResults } = useGetResultQuery();

  // Mutations
  const [createChapter, { isLoading: creatingChapter }] =
    useCreateChapterMutation();
  const [createQuestion, { isLoading: creatingQuestion }] =
    useCreateQuestionMutation();
  const [updateQuestion, { isLoading: updatingQuestion }] =
    useUpdateQuestionMutation();

  const chapters = chaptersData?.data || [];
  const questions = questionsData?.data || [];
  const results = resultsData?.data || [];

  // Mock data for users and analytics
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Arun Kumar",
      email: "arun@example.com",
      class: "8",
      status: "active",
      joined: "2024-01-15",
    },
    {
      id: 2,
      name: "Meera S",
      email: "meera@example.com",
      class: "7",
      status: "active",
      joined: "2024-01-10",
    },
    {
      id: 3,
      name: "Rahul P",
      email: "rahul@example.com",
      class: "9",
      status: "inactive",
      joined: "2024-01-05",
    },
    {
      id: 4,
      name: "Sneha M",
      email: "sneha@example.com",
      class: "6",
      status: "active",
      joined: "2024-01-20",
    },
  ]);

  const tabs = [
    { id: "dashboard", name: "Dashboard", icon: ChartBarIcon },
    { id: "chapters", name: "Chapters", icon: BookOpenIcon },
    { id: "questions", name: "Questions", icon: DocumentTextIcon },
    { id: "users", name: "Users", icon: UsersIcon },
    { id: "results", name: "Results", icon: AcademicCapIcon },
    { id: "settings", name: "Settings", icon: Cog6ToothIcon },
  ];

  const calculateStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === "active").length;
    const totalChapters = chapters.length;
    const totalQuestions = questions.length;
    const totalResults = results.length;
    const avgScore =
      results.length > 0
        ? results.reduce((sum, r) => sum + r.score, 0) / results.length
        : 0;

    return {
      totalUsers,
      activeUsers,
      totalChapters,
      totalQuestions,
      totalResults,
      avgScore: avgScore.toFixed(1),
    };
  };

  const stats = calculateStats();

  const handleAddItem = async (data) => {
    try {
      if (modalType === "chapter") {
        await createChapter(data).unwrap();
        toast.success("Chapter created successfully!");
        refetchChapters();
      } else if (modalType === "question") {
        await createQuestion(data).unwrap();
        toast.success("Question created successfully!");
        refetchQuestions();
      }
      setShowAddModal(false);
    } catch (error) {
      toast.error("Failed to create item. Please try again.");
    }
  };

  const handleDeleteItem = (type, id) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      toast.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`,
      );
      // In production, call delete API here
    }
  };

  const handleExportData = (type) => {
    toast.success(`${type} data exported successfully`);
    // In production, implement actual export logic
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Users</p>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <UsersIcon className="h-10 w-10 opacity-80" />
                </div>
                <div className="mt-4 text-sm">
                  <span className="text-green-300">
                    ↑ {stats.activeUsers} active
                  </span>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Total Chapters</p>
                    <p className="text-3xl font-bold">{stats.totalChapters}</p>
                  </div>
                  <BookOpenIcon className="h-10 w-10 opacity-80" />
                </div>
                <div className="mt-4 text-sm">
                  <span>Across all classes</span>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Total Questions</p>
                    <p className="text-3xl font-bold">{stats.totalQuestions}</p>
                  </div>
                  <DocumentTextIcon className="h-10 w-10 opacity-80" />
                </div>
                <div className="mt-4 text-sm">
                  <span>Practice questions</span>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Avg. Score</p>
                    <p className="text-3xl font-bold">{stats.avgScore}%</p>
                  </div>
                  <AcademicCapIcon className="h-10 w-10 opacity-80" />
                </div>
                <div className="mt-4 text-sm">
                  <span>From {stats.totalResults} attempts</span>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => {
                    setModalType("chapter");
                    setShowAddModal(true);
                  }}
                  className="p-4 bg-blue-50 text-blue-700 rounded-xl border border-blue-200 hover:bg-blue-100"
                >
                  <PlusIcon className="h-6 w-6 mb-2" />
                  <div className="font-bold">Add Chapter</div>
                </button>

                <button
                  onClick={() => {
                    setModalType("question");
                    setShowAddModal(true);
                  }}
                  className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 hover:bg-green-100"
                >
                  <DocumentTextIcon className="h-6 w-6 mb-2" />
                  <div className="font-bold">Add Question</div>
                </button>

                <button
                  onClick={() => setActiveTab("users")}
                  className="p-4 bg-purple-50 text-purple-700 rounded-xl border border-purple-200 hover:bg-purple-100"
                >
                  <UserGroupIcon className="h-6 w-6 mb-2" />
                  <div className="font-bold">Manage Users</div>
                </button>

                <button
                  onClick={() => handleExportData("all")}
                  className="p-4 bg-orange-50 text-orange-700 rounded-xl border border-orange-200 hover:bg-orange-100"
                >
                  <ArrowDownTrayIcon className="h-6 w-6 mb-2" />
                  <div className="font-bold">Export Data</div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  {
                    action: "New user registered",
                    user: "Arun Kumar",
                    time: "10 min ago",
                  },
                  {
                    action: "Chapter created",
                    user: "Admin",
                    time: "30 min ago",
                  },
                  {
                    action: "High score achieved",
                    user: "Meera S",
                    score: "95%",
                    time: "1 hour ago",
                  },
                  {
                    action: "Question added",
                    user: "Admin",
                    count: "15 questions",
                    time: "2 hours ago",
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BellIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold">{activity.action}</p>
                        <p className="text-sm text-gray-600">
                          by {activity.user} • {activity.time}
                        </p>
                      </div>
                    </div>
                    {activity.score && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                        {activity.score}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "chapters":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Manage Chapters</h3>
              <button
                onClick={() => {
                  setModalType("chapter");
                  setShowAddModal(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Chapter</span>
              </button>
            </div>

            {chapters.length === 0 ? (
              <EmptyState
                title="No chapters yet"
                message="Start by creating your first chapter"
                icon="book"
                actionText="Add Chapter"
                onAction={() => {
                  setModalType("chapter");
                  setShowAddModal(true);
                }}
              />
            ) : (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Chapter
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Class & Subject
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Questions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {chapters.map((chapter) => (
                        <tr key={chapter._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="font-medium text-gray-900">
                                {chapter.chapterName}
                              </div>
                              <div className="text-sm text-gray-500">
                                Ch. {chapter.chapterNumber}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              Class {chapter.standard}
                            </div>
                            <div className="text-sm text-gray-500">
                              {chapter.subject}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              {chapter.totalQuestions || 0} questions
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 rounded-full text-sm ${
                                chapter.isFree
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {chapter.isFree ? "Free" : "Premium"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSelectedItem(chapter)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </button>
                              <button className="text-yellow-600 hover:text-yellow-900">
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteItem("chapter", chapter._id)
                                }
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      case "questions":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Manage Questions</h3>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border rounded-lg w-64"
                />
                <button
                  onClick={() => {
                    setModalType("question");
                    setShowAddModal(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Add Question</span>
                </button>
              </div>
            </div>

            {questions.length === 0 ? (
              <EmptyState
                title="No questions yet"
                message="Start by adding practice questions"
                icon="document"
                actionText="Add Question"
                onAction={() => {
                  setModalType("question");
                  setShowAddModal(true);
                }}
              />
            ) : (
              <div className="space-y-4">
                {questions
                  .filter(
                    (q) =>
                      q.question
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      q.chapter
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()),
                  )
                  .map((question) => (
                    <div
                      key={question._id}
                      className="bg-white rounded-xl shadow p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-2">
                            {question.question}
                          </h4>
                          <div className="flex items-center space-x-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              Class {question.standard}
                            </span>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                              {question.subject}
                            </span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                              {question.difficulty}
                            </span>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                              {question.marks} mark
                              {question.marks > 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg">
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteItem("question", question._id)
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {question.options && (
                        <div className="mb-4">
                          <p className="font-medium mb-2">Options:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {question.options.map((option, index) => (
                              <div
                                key={index}
                                className={`p-3 rounded-lg border ${
                                  option === question.correctAnswer
                                    ? "border-green-500 bg-green-50"
                                    : "border-gray-200 bg-gray-50"
                                }`}
                              >
                                <span className="font-bold mr-2">
                                  {String.fromCharCode(65 + index)}.
                                </span>
                                {option}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-sm text-gray-600">
                        Correct Answer:{" "}
                        <span className="font-bold text-green-700">
                          {question.correctAnswer}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        );

      case "users":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Manage Users</h3>
              <button
                onClick={() => {
                  setModalType("user");
                  setShowAddModal(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add User</span>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                              {user.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            Class {user.class}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              user.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.joined}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button className="text-yellow-600 hover:text-yellow-900">
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "results":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Student Results</h3>
              <button
                onClick={() => handleExportData("results")}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>Export Results</span>
              </button>
            </div>

            {results.length === 0 ? (
              <EmptyState
                title="No results yet"
                message="Student results will appear here as they practice"
                icon="academic-cap"
              />
            ) : (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quiz
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Correct/Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.map((result) => (
                        <tr key={result._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                {result.username?.charAt(0) || "S"}
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">
                                  {result.username}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {result.quizTitle}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-bold ${
                                result.score >= 80
                                  ? "bg-green-100 text-green-800"
                                  : result.score >= 60
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {result.score}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.correctAnswers}/{result.totalQuestions}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(result.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      case "settings":
        return (
          <div className="space-y-8">
            <h3 className="text-xl font-bold">Admin Settings</h3>

            {/* General Settings */}
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="font-bold text-lg mb-4">General Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Student Registration</p>
                    <p className="text-sm text-gray-600">
                      Allow new students to register
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-600">
                      Send email updates to students
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Backup & Restore */}
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="font-bold text-lg mb-4">Backup & Restore</h4>
              <div className="space-y-4">
                <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-center hover:border-blue-500 hover:bg-blue-50">
                  <ArrowUpTrayIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="font-medium">Upload Backup File</p>
                  <p className="text-sm text-gray-600">
                    JSON, CSV, or Excel format
                  </p>
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleExportData("backup")}
                    className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100"
                  >
                    <ArrowDownTrayIcon className="h-6 w-6 mb-2" />
                    <div className="font-bold">Export Backup</div>
                  </button>

                  <button className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 hover:bg-red-100">
                    <TrashIcon className="h-6 w-6 mb-2" />
                    <div className="font-bold">Reset Data</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const AddModal = () => {
    const [formData, setFormData] = useState({
      // Chapter form
      chapterName: "",
      chapterNumber: "",
      standard: "",
      subject: "",
      description: "",

      // Question form
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
      difficulty: "Medium",
      marks: 1,

      // User form
      name: "",
      email: "",
      class: "",
      password: "",
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      let data = {};

      if (modalType === "chapter") {
        data = {
          chapterName: formData.chapterName,
          chapterNumber: parseInt(formData.chapterNumber),
          standard: parseInt(formData.standard),
          subject: formData.subject,
          description: formData.description,
          isFree: true,
        };
      } else if (modalType === "question") {
        data = {
          question: formData.question,
          options: formData.options.filter((opt) => opt.trim() !== ""),
          correctAnswer: formData.correctAnswer,
          explanation: formData.explanation,
          difficulty: formData.difficulty,
          marks: parseInt(formData.marks),
          questionType: "MCQ",
          isFree: true,
        };
      } else if (modalType === "user") {
        data = {
          name: formData.name,
          email: formData.email,
          class: formData.class,
          password: formData.password,
          role: "student",
        };
      }

      handleAddItem(data);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">
              Add New {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {modalType === "chapter" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Chapter Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.chapterName}
                    onChange={(e) =>
                      setFormData({ ...formData, chapterName: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Enter chapter name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Chapter Number
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.chapterNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          chapterNumber: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Class
                    </label>
                    <select
                      required
                      value={formData.standard}
                      onChange={(e) =>
                        setFormData({ ...formData, standard: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Select Class</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>
                          Class {num}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subject
                  </label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select Subject</option>
                    <option value="Maths">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Social Science">Social Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    rows="3"
                    placeholder="Enter chapter description"
                  />
                </div>
              </>
            )}

            {modalType === "question" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Question
                  </label>
                  <textarea
                    required
                    value={formData.question}
                    onChange={(e) =>
                      setFormData({ ...formData, question: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    rows="3"
                    placeholder="Enter your question"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Options
                  </label>
                  {formData.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 mb-2"
                    >
                      <span className="w-6 text-center">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[index] = e.target.value;
                          setFormData({ ...formData, options: newOptions });
                        }}
                        className="flex-1 px-4 py-2 border rounded-lg"
                        placeholder={`Option ${String.fromCharCode(
                          65 + index,
                        )}`}
                      />
                      {option === formData.correctAnswer && (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Correct Answer
                  </label>
                  <select
                    required
                    value={formData.correctAnswer}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        correctAnswer: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select Correct Option</option>
                    {formData.options
                      .filter((opt) => opt.trim() !== "")
                      .map((option, index) => (
                        <option key={index} value={option}>
                          {String.fromCharCode(65 + index)}: {option}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Difficulty
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) =>
                        setFormData({ ...formData, difficulty: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Marks
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.marks}
                      onChange={(e) =>
                        setFormData({ ...formData, marks: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Explanation
                  </label>
                  <textarea
                    value={formData.explanation}
                    onChange={(e) =>
                      setFormData({ ...formData, explanation: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    rows="3"
                    placeholder="Enter explanation for the answer"
                  />
                </div>
              </>
            )}

            {modalType === "user" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Class
                    </label>
                    <select
                      required
                      value={formData.class}
                      onChange={(e) =>
                        setFormData({ ...formData, class: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Select Class</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>
                          Class {num}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Enter password"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingChapter || creatingQuestion}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {creatingChapter || creatingQuestion ? "Adding..." : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your learning platform</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 bg-gray-100 px-4 py-2 rounded-full">
            <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium">Admin User</div>
              <div className="text-xs text-gray-500">Super Admin</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="border-b">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">{renderTabContent()}</div>
      </div>

      {/* Add Modal */}
      {showAddModal && <AddModal />}
    </div>
  );
};

export default AdminDashBoard;
