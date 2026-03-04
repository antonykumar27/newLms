import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, UserPlus } from "lucide-react";

const AddResourceModal = ({ isOpen, onClose, onSubmit, type }) => {
  const [formData, setFormData] = useState({
    // For adding hours
    section: "webApp",
    subsection: "frontend",
    field: "reactJs",
    hours: 0,
    ratePerHour: 2000,

    // For adding third party
    name: "",
    setup: 0,
    integration: 0,

    // For adding device
    deviceType: "ios",
    count: 1,
    rental: 0,
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <UserPlus className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Add{" "}
              {type === "hours"
                ? "Development Hours"
                : type === "thirdParty"
                  ? "Third Party Integration"
                  : "Device Testing"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === "hours" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Section
                </label>
                <select
                  value={formData.section}
                  onChange={(e) =>
                    setFormData({ ...formData, section: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="webApp">Web App</option>
                  <option value="mobileApp">Mobile App</option>
                  <option value="design">Design</option>
                  <option value="qaTesting">QA & Testing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subsection
                </label>
                <select
                  value={formData.subsection}
                  onChange={(e) =>
                    setFormData({ ...formData, subsection: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {formData.section === "webApp" && (
                    <>
                      <option value="frontend">Frontend</option>
                      <option value="backend">Backend</option>
                      <option value="database">Database</option>
                      <option value="thirdParty">Third Party</option>
                    </>
                  )}
                  {formData.section === "mobileApp" && (
                    <>
                      <option value="crossPlatform">Cross Platform</option>
                      <option value="ioSpecific">iOS Specific</option>
                      <option value="androidSpecific">Android Specific</option>
                      <option value="mobileFeatures">Mobile Features</option>
                    </>
                  )}
                  {formData.section === "design" && (
                    <>
                      <option value="webDesign">Web Design</option>
                      <option value="mobileDesign">Mobile Design</option>
                      <option value="branding">Branding</option>
                    </>
                  )}
                  {formData.section === "qaTesting" && (
                    <>
                      <option value="manualTesting">Manual Testing</option>
                      <option value="automatedTesting">
                        Automated Testing
                      </option>
                      <option value="deviceTesting">Device Testing</option>
                      <option value="securityAudit">Security Audit</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Field Name
                </label>
                <input
                  type="text"
                  value={formData.field}
                  onChange={(e) =>
                    setFormData({ ...formData, field: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., reactJs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.hours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hours: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rate/Hour (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.ratePerHour}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ratePerHour: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          {type === "thirdParty" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Service Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., paymentGateway"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Setup Cost (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.setup}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        setup: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Integration (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.integration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        integration: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </>
          )}

          {type === "device" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Device Type
                </label>
                <select
                  value={formData.deviceType}
                  onChange={(e) =>
                    setFormData({ ...formData, deviceType: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                >
                  <option value="ios">iOS Devices</option>
                  <option value="android">Android Devices</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.count}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        count: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rental Cost (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.rental}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rental: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Add Resource
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddResourceModal;
