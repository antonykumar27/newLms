// components/StandardSubjectForm.jsx
import React, { useState, useEffect } from "react";
import {
  useCreateStandardSubjectMutation,
  useUpdateStandardSubjectMutation,
  useGetStandardSubjectByIdQuery,
  useGetStandardForTeacherQuery, //All standard get here
} from "../store/api/StandardSubjectApi";
import { toast } from "react-toastify";
import {
  Upload,
  BookOpen,
  DollarSign,
  Calendar,
  Percent,
  Tag,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

const TeacherStandardSubjectForm = ({
  standardSubjectId = null,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    standard: "",
    subject: "",
    part: "",
    medium: "",
    media: null,
    pricing: {
      monthlyPrice: "",
      yearlyPrice: "",
      discount: {
        type: "",
        value: "",
      },
      gstPercentage: 18,
    },
  });
  const { data: exstingStandards, isLoading } = useGetStandardForTeacherQuery();
  console.log("exstingStandards", exstingStandards);
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

  useEffect(() => {
    if (existingData?.data) {
      const data = existingData.data;
      const existingPricing = data.pricing || {};

      setFormData({
        standard: data.standard,
        subject: data.subject || "",
        part: data.part || "",
        medium: data.medium || "",
        media: data.media?.[0] || null,
        pricing: {
          monthlyPrice: existingPricing.monthlyPrice || data.rate || "",
          yearlyPrice: existingPricing.yearlyPrice || "",
          discount: {
            type: existingPricing.discount?.type || "",
            value: existingPricing.discount?.value || "",
          },
          gstPercentage: existingPricing.gstPercentage || 18,
        },
      });

      // Set image preview if media exists
      if (data.media?.[0]?.url) {
        setImagePreview(data.media[0].url);
      }
    }
  }, [existingData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Pricing fields
    if (name.startsWith("pricing.")) {
      const keys = name.split("."); // ["pricing","discount","type"]

      setFormData((prev) => {
        const updated = { ...prev };

        if (keys.length === 2) {
          // pricing.monthlyPrice, pricing.gstPercentage
          updated.pricing[keys[1]] = value;
        }

        if (keys.length === 3 && keys[1] === "discount") {
          updated.pricing.discount[keys[2]] = value;

          // 🔥 reset discount value when type changes
          if (keys[2] === "type") {
            updated.pricing.discount.value = "";
          }
        }

        return updated;
      });

      return;
    }

    // Normal fields
    setFormData((prev) => ({
      ...prev,
      [name]: name === "standard" ? Number(value) || "" : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match("image.*")) {
        toast.error("Please select an image file (JPEG, PNG, etc.)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Create FormData for image upload
      setFormData({
        ...formData,
        media: file,
      });

      // Create preview
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

  const calculateYearlyFromMonthly = (monthly) => {
    if (!monthly) return "";
    const yearly = parseFloat(monthly) * 12;
    return yearly.toFixed(2);
  };

  const handleMonthlyPriceChange = (e) => {
    const monthlyValue = e.target.value;
    const yearlyValue = calculateYearlyFromMonthly(monthlyValue);

    setFormData((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        monthlyPrice: monthlyValue,
        yearlyPrice: yearlyValue,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate standard
      if (
        !formData.standard ||
        formData.standard < 1 ||
        formData.standard > 12
      ) {
        toast.error("Standard must be between 1 and 12");
        setLoading(false);
        return;
      }

      // Validate subject
      if (!formData.subject.trim()) {
        toast.error("Subject is required");
        setLoading(false);
        return;
      }

      // Validate pricing
      if (
        !formData.pricing.monthlyPrice ||
        parseFloat(formData.pricing.monthlyPrice) <= 0
      ) {
        toast.error("Monthly price is required and must be greater than 0");
        setLoading(false);
        return;
      }

      // Validate discount value if type is selected
      if (formData.pricing.discount.type && !formData.pricing.discount.value) {
        toast.error("Please enter discount value");
        setLoading(false);
        return;
      }

      // Validate percentage discount (0-100)
      if (
        formData.pricing.discount.type === "percentage" &&
        formData.pricing.discount.value &&
        (parseFloat(formData.pricing.discount.value) < 0 ||
          parseFloat(formData.pricing.discount.value) > 100)
      ) {
        toast.error("Percentage discount must be between 0 and 100");
        setLoading(false);
        return;
      }

      // Create FormData object for multipart/form-data
      const submitFormData = new FormData();

      // Add text fields
      submitFormData.append("standard", formData.standard);
      submitFormData.append("medium", formData.medium);
      submitFormData.append("subject", formData.subject.trim());

      // Add pricing data
      submitFormData.append(
        "pricing[monthlyPrice]",
        formData.pricing.monthlyPrice,
      );
      submitFormData.append(
        "pricing[yearlyPrice]",
        formData.pricing.yearlyPrice,
      );
      submitFormData.append(
        "pricing[gstPercentage]",
        formData.pricing.gstPercentage,
      );

      // Add discount data ONLY if type is selected
      if (formData.pricing.discount.type) {
        submitFormData.append(
          "pricing[discount][type]",
          formData.pricing.discount.type,
        );
        submitFormData.append(
          "pricing[discount][value]",
          formData.pricing.discount.value || 0,
        );
      }

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

      // Debug: Log FormData contents
      console.log("FormData being sent:");
      for (let pair of submitFormData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
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
            {/* Medium Selection */}
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
                  disabled={!!standardSubjectId}
                >
                  <option value="">Select Medium</option>
                  {["english", "malayalam"].map((medium) => (
                    <option key={medium} value={medium}>
                      {medium.charAt(0).toUpperCase() + medium.slice(1)}
                    </option>
                  ))}
                </select>
                <BookOpen className="absolute left-3 top-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                Note: Once created, medium cannot be changed
              </p>
            </div>

            {/* Standard Input */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Standard *
              </label>
              <select
                name="standard"
                value={formData.standard}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                required
                disabled={!!standardSubjectId}
              >
                <option value="">Select Standard</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Standard {i + 1}
                  </option>
                ))}
              </select>
              <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                Note: Once created, standard cannot be changed
              </p>
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

            {/* Pricing Section */}
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-gray-700">
              <div className="flex items-center mb-4">
                <DollarSign className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold">Pricing Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Monthly Price */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Monthly Price *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="pricing.monthlyPrice"
                      value={formData.pricing.monthlyPrice}
                      onChange={handleMonthlyPriceChange}
                      className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>

                {/* Yearly Price (auto-calculated) */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Yearly Price (Auto-calculated)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="pricing.yearlyPrice"
                      value={formData.pricing.yearlyPrice}
                      readOnly
                      className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed transition-colors duration-300"
                    />
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Discount Type
                  </label>
                  <select
                    name="pricing.discount.type"
                    value={formData.pricing.discount.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  >
                    <option value="">No Discount</option>
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat</option>
                  </select>
                </div>

                {/* Discount Value - Only show if discount type is selected */}
                {formData.pricing.discount.type && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      {formData.pricing.discount.type === "percentage"
                        ? "Discount Percentage *"
                        : "Flat Discount Amount *"}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="pricing.discount.value"
                        value={formData.pricing.discount.value}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                        placeholder={
                          formData.pricing.discount.type === "percentage"
                            ? "Enter percentage (0-100)"
                            : "Enter flat amount"
                        }
                        min="0"
                        step={
                          formData.pricing.discount.type === "percentage"
                            ? "1"
                            : "0.01"
                        }
                        max={
                          formData.pricing.discount.type === "percentage"
                            ? "100"
                            : undefined
                        }
                        required
                      />
                      {formData.pricing.discount.type === "percentage" ? (
                        <Percent className="absolute left-3 top-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    {formData.pricing.discount.type === "percentage" && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Enter percentage value (0-100)
                      </p>
                    )}
                  </div>
                )}

                {/* GST Percentage */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    GST Percentage
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="pricing.gstPercentage"
                      value={formData.pricing.gstPercentage}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      placeholder="18"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                    <Percent className="absolute left-3 top-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
              </div>
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
