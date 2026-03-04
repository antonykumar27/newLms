// components/StandardSubjectForm.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  useCreateStandardSubjectMutation,
  useUpdateStandardSubjectMutation,
  useGetStandardSubjectByIdQuery,
  useGetStandardForTeacherQuery,
} from "../store/api/StandardSubjectApi";
import { toast } from "react-toastify";
import { Upload, BookOpen, Trash2, Image as ImageIcon } from "lucide-react";

const TeacherStandardSubjectForm = ({
  standardSubjectId = null,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    standardId: "", // 🔑 for backend
    standard: "", // 🔑 for UI / logic
    medium: "",
    subject: "",
    part: "",
    media: null,
  });

  console.log("formData", formData);
  // Fetch existing standards from server
  const { data: exstingStandards, isLoading: isLoadingStandards } =
    useGetStandardForTeacherQuery();

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // RTK Query hooks
  const [createStandardSubject, { isLoading: isCreating }] =
    useCreateStandardSubjectMutation();
  const [updateStandardSubject, { isLoading: isUpdating }] =
    useUpdateStandardSubjectMutation();

  // Fetch data if editing
  const { data: existingData, isLoading: isFetching } =
    useGetStandardSubjectByIdQuery(standardSubjectId, {
      skip: !standardSubjectId,
    });

  // Get all unique standards from existing data
  const availableStandards = useMemo(() => {
    if (!exstingStandards?.data) return [];

    const standards = new Set(
      exstingStandards.data.map((item) => item.standard),
    );
    return Array.from(standards).sort((a, b) => a - b);
  }, [exstingStandards]);

  // Get available mediums for selected standard
  const availableMediums = useMemo(() => {
    if (!formData.standard || !exstingStandards?.data) return [];

    return exstingStandards.data
      .filter((item) => item.standard === parseInt(formData.standard))
      .map((item) => item.medium)
      .filter((medium, index, self) => self.indexOf(medium) === index); // Get unique mediums
  }, [formData.standard, exstingStandards]);

  // Check if standard+medium combination already exists
  const isStandardMediumCombinationExists = useMemo(() => {
    if (!formData.standard || !formData.medium || !exstingStandards?.data)
      return false;

    return exstingStandards.data.some(
      (item) =>
        item.standard === parseInt(formData.standard) &&
        item.medium === formData.medium,
    );
  }, [formData.standard, formData.medium, exstingStandards]);

  useEffect(() => {
    if (existingData?.data) {
      const data = existingData.data;

      setFormData({
        standardId: data._id,
        standard: data.standard,
        subject: data.subject || "",
        part: data.part || "",
        medium: data.medium || "",
        media: data.media?.[0] || null,
      });

      // Set image preview if media exists
      if (data.media?.[0]?.url) {
        setImagePreview(data.media[0].url);
      }
    }
  }, [existingData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "standard") {
      const selected = exstingStandards.data.find((item) => item._id === value);

      if (!selected) return;

      setFormData((prev) => ({
        ...prev,
        standardId: selected._id, // ✅ send to server
        standard: selected.standard, // ✅ display / logic
        medium: selected.medium || "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match("image.*")) {
        toast.error("Please select an image file (JPEG, PNG, etc.)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setFormData({
        ...formData,
        media: file,
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      media: null,
    });
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate standard
      if (!formData.standard) {
        toast.error("Please select a standard");
        setLoading(false);
        return;
      }

      // Validate medium
      if (!formData.medium) {
        toast.error("Please select a medium");
        setLoading(false);
        return;
      }

      // Check if standard+medium combination already exists (for create mode only)
      // if (!standardSubjectId && isStandardMediumCombinationExists) {
      //   toast.error(
      //     `Standard ${formData.standard} with ${formData.medium} medium already exists`,
      //   );
      //   setLoading(false);
      //   return;
      // }

      // Validate subject
      if (!formData.subject.trim()) {
        toast.error("Subject is required");
        setLoading(false);
        return;
      }

      // Create FormData object for multipart/form-data
      const submitFormData = new FormData();

      // Add text fields
      submitFormData.append("standard", formData.standard);
      submitFormData.append("standardId", formData.standardId);
      submitFormData.append("medium", formData.medium);
      submitFormData.append("subject", formData.subject.trim());

      // Add part if exists
      if (formData.part.trim()) {
        submitFormData.append("part", formData.part.trim());
      }

      // Add media if exists
      if (formData.media) {
        if (formData.media instanceof File) {
          submitFormData.append("media", formData.media);
        } else if (typeof formData.media === "string") {
          submitFormData.append("media", formData.media);
        } else if (formData.media.url) {
          submitFormData.append("media", formData.media.url);
        }
      }

      // Add ID for update
      if (standardSubjectId) {
        submitFormData.append("id", standardSubjectId);
      }

      let response;
      if (standardSubjectId) {
        // Update existing
        response = await updateStandardSubject(submitFormData).unwrap();
        toast.success("Standard subject updated successfully!");
      } else {
        // Create new
        response = await createStandardSubject(submitFormData).unwrap();
        toast.success("Standard subject created successfully!");
      }

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error?.data?.message ||
          error?.data?.errors?.join(", ") ||
          "Something went wrong!",
      );
    } finally {
      setLoading(false);
    }
  };

  if (isFetching && standardSubjectId) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (isLoadingStandards && !standardSubjectId) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
        <span className="ml-2">Loading standards...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-300">
          <div className="flex items-center mb-6">
            <BookOpen className="h-8 w-8 mr-3 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold">
              {standardSubjectId
                ? "Edit Standard Subject"
                : "Create New Standard Subject"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Standard Selection (First) */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Standard *
              </label>
              <select
                name="standard"
                value={formData.standardId} // ✅ IMPORTANT
                onChange={handleInputChange}
                required
                disabled={!!standardSubjectId || isLoadingStandards}
                className="w-full px-4 py-3 rounded-lg border"
              >
                <option value="">Select Standard</option>

                {exstingStandards?.data?.map((item) => (
                  <option key={item._id} value={item._id}>
                    Standard {item.standard}
                  </option>
                ))}
              </select>

              {formData.standard && availableStandards.length > 0 && (
                <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                  Available standards: {availableStandards.join(", ")}
                </p>
              )}
            </div>

            {/* Medium Selection (Shows after standard is selected) */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Medium *
              </label>
              <div className="relative">
                <select
                  name="medium"
                  value={formData.medium}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  required
                  disabled={!!standardSubjectId || !formData.standard}
                >
                  <option value="">Select Medium</option>
                  {formData.standard ? (
                    availableMediums.map((medium) => (
                      <option key={medium} value={medium}>
                        {medium.charAt(0).toUpperCase() + medium.slice(1)}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Please select a standard first
                    </option>
                  )}
                </select>
                <BookOpen className="absolute left-3 top-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>

              {!standardSubjectId && isStandardMediumCombinationExists && (
                <p className="text-sm mt-2 text-red-600 dark:text-red-400">
                  ⚠️ Standard {formData.standard} with {formData.medium} medium
                  already exists
                </p>
              )}

              {formData.standard && availableMediums.length === 0 && (
                <p className="text-sm mt-2 text-yellow-600 dark:text-yellow-400">
                  No mediums available for Standard {formData.standard}
                </p>
              )}
            </div>

            {/* Subject Input */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                placeholder="Enter subject name"
                required
              />
            </div>

            {/* Part Input */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Part (Optional)
              </label>
              <input
                type="text"
                name="part"
                value={formData.part}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                placeholder="Enter part name"
              />
            </div>

            {/* Media Upload Section */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                Media (Optional)
              </label>

              <div className="space-y-4">
                {/* File Upload Input */}
                <div className="flex items-center space-x-4">
                  <label className="flex-1">
                    <div className="group flex flex-col items-center justify-center px-4 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600 transition-all duration-300 hover:scale-[1.02]">
                      <Upload className="h-12 w-12 mb-3 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        Click to upload
                      </p>
                      <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Image Preview */}
                {(imagePreview || formData.media) && (
                  <div className="relative p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <ImageIcon className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Selected Image
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="flex items-center px-3 py-1 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-300"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </button>
                    </div>
                    <div className="flex justify-center">
                      <img
                        src={
                          imagePreview || formData.media?.url || formData.media
                        }
                        alt="Preview"
                        className="max-h-64 rounded-lg object-contain shadow-lg"
                      />
                    </div>
                    <p className="text-xs mt-3 text-center text-gray-500 dark:text-gray-400">
                      {formData.media instanceof File
                        ? formData.media.name
                        : "Existing image"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-105"
                disabled={loading || isCreating || isUpdating}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || isCreating || isUpdating}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading || isCreating || isUpdating ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    {standardSubjectId ? "Updating..." : "Creating..."}
                  </span>
                ) : standardSubjectId ? (
                  "Update Standard Subject"
                ) : (
                  "Create Standard Subject"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherStandardSubjectForm;
