import React, { useState } from "react";
import { useGetChaptersBySubjectQuery } from "../store/api/EachChapterApi";
import ChapterList from "./ChapterList";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "../admin/EmptyState";
import {
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useParams, useNavigate } from "react-router-dom";

const StudentSubjectChapter = () => {
  const { id: subjectId } = useParams();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    standard: "",
    subject: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Use the correct query hook for chapters by subject
  const {
    data: chaptersData,
    isLoading,
    error,
  } = useGetChaptersBySubjectQuery(subjectId);

  console.log("Chapters Data:", chaptersData);

  // Extract chapters from response
  const chapters = chaptersData?.data || [];
  const subjectInfo = chaptersData?.subject || {};

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ standard: "", subject: "" });
  };

  const hasActiveFilters = filters.standard || filters.subject;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">All Chapters Your </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select your class and subject to explore all available chapters. Each
          chapter includes theory, examples, and practice questions.
        </p>
      </div>

      {/* Subject Info Card */}
      {subjectInfo && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {subjectInfo.subjects?.join(", ")} - Standard{" "}
                {subjectInfo.standard}
              </h2>
              {subjectInfo.part?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {subjectInfo.part.map((part, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full"
                    >
                      {part}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-gray-600 mt-2">
                Total Chapters:{" "}
                <span className="font-bold">{chapters.length}</span>
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() =>
                  navigate(
                    `/quizOverview/ChapterRelatedpages/create/${subjectId}`,
                  )
                }
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition flex items-center gap-2"
              >
                <span>+ Create Chapter</span>
              </button>
              <button
                onClick={() =>
                  navigate(`/quizOverview/subjects/${subjectId}/edit`)
                }
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                Edit Subject
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto mb-8 px-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-gray-800 text-lg font-medium mb-2">
            ഇത് ക്ലാസ് അല്ല 🙂
          </p>

          <p className="text-gray-600 leading-relaxed">
            നീ തിരഞ്ഞെടുത്ത ഈ പാഠം
            <span className="font-semibold"> നിനക്ക് മനസിലാകുന്ന രീതിയിൽ </span>
            പഠിക്കാൻ സഹായിക്കുകയാണ്.
            <br />
            തെറ്റ് വന്നാൽ പ്രശ്നമില്ല — അത് പഠനത്തിന്റെ ഭാഗമാണ്.
          </p>

          <p className="text-gray-700 mt-3 font-medium">
            നമുക്ക് ഒന്ന് ശ്രമിക്കാം — അത്ര മാത്രം. 🌱
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center space-x-2 px-4 py-2 rounded-lg border hover:bg-gray-50"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              <span>Filters</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700"
              >
                <XMarkIcon className="h-4 w-4" />
                <span>Clear filters</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Total Chapters Badge */}
            <div className="px-4 py-2 bg-gray-100 rounded-lg">
              <span className="font-medium">
                {chapters.length} Chapter{chapters.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Sort Options */}
            <div>
              <select className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500">
                <option value="chapterNumber">Sort by Chapter Number</option>
                <option value="title">Sort by Title</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <div className="mt-6 md:hidden p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5" />
                <span>Filters</span>
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Chapters List */}
      <div>
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-600 mb-4">Failed to load chapters</div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : chapters.length === 0 ? (
          <EmptyState
            title="No chapters yet"
            message="Start by creating the first chapter for this subject."
            actionText="Create First Chapter"
            onAction={() =>
              navigate(`/quizOverview/chapters/create/${subjectId}`)
            }
          />
        ) : (
          <ChapterList chapters={chapters} subjectId={subjectId} />
        )}
      </div>
    </div>
  );
};

export default StudentSubjectChapter;
