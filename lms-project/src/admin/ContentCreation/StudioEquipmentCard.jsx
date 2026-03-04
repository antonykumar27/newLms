import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Mic,
  Sunset,
  Monitor,
  FileText,
  Trash2,
  Edit,
  Plus,
  X,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import { useDeleteCameraMutation } from "../../store/api/contentCreationApi";
import { toast } from "react-toastify";

const StudioEquipmentCard = ({
  data,
  isEditing,
  onInputChange,
  planId,
  onRefresh,
}) => {
  const [deleteCamera] = useDeleteCameraMutation();
  const [editingCamera, setEditingCamera] = useState(null);

  const handleDeleteCamera = async (cameraId) => {
    if (window.confirm("Are you sure you want to delete this camera?")) {
      try {
        await deleteCamera({ id: planId, cameraId }).unwrap();
        toast.success("Camera deleted successfully");
        onRefresh();
      } catch (error) {
        toast.error("Failed to delete camera");
      }
    }
  };

  const handleEditCamera = (camera) => {
    setEditingCamera(camera);
  };

  const handleSaveEdit = async () => {
    // Implement edit logic
    setEditingCamera(null);
  };

  return (
    <div className="space-y-6">
      {/* Recording Room */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Recording Room
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Type
            </label>
            {isEditing ? (
              <select
                value={data.recordingRoom?.type || "owned"}
                onChange={(e) =>
                  onInputChange(
                    "studioEquipment",
                    "recordingRoom",
                    "type",
                    e.target.value,
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="rented">Rented</option>
                <option value="owned">Owned</option>
                <option value="homeStudio">Home Studio</option>
              </select>
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                {data.recordingRoom?.type || "Owned"}
              </p>
            )}
          </div>

          {data.recordingRoom?.type === "rented" && (
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Monthly Rent
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={data.recordingRoom?.monthlyRent || 0}
                  onChange={(e) =>
                    onInputChange(
                      "studioEquipment",
                      "recordingRoom",
                      "monthlyRent",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(data.recordingRoom?.monthlyRent || 0)}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Soundproofing
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.recordingRoom?.soundproofing || 0}
                onChange={(e) =>
                  onInputChange(
                    "studioEquipment",
                    "recordingRoom",
                    "soundproofing",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.recordingRoom?.soundproofing || 0)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Lighting Setup
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.recordingRoom?.lightingSetup || 0}
                onChange={(e) =>
                  onInputChange(
                    "studioEquipment",
                    "recordingRoom",
                    "lightingSetup",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.recordingRoom?.lightingSetup || 0)}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Cameras */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Camera className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Cameras
            </h3>
          </div>
          {isEditing && (
            <button className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="space-y-4">
          {data.cameras?.map((camera, index) => (
            <motion.div
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {camera.brand} {camera.model}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Type: {camera.type} | Qty: {camera.quantity}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(camera.totalPrice)}
                  </span>
                  {isEditing && (
                    <>
                      <button
                        onClick={() => handleEditCamera(camera)}
                        className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCamera(camera._id)}
                        className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {(!data.cameras || data.cameras.length === 0) && (
            <p className="text-center text-gray-500 dark:text-gray-500 py-4">
              No cameras added yet
            </p>
          )}
        </div>
      </motion.div>

      {/* Audio Equipment */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Mic className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Audio Equipment
          </h3>
        </div>

        <div className="space-y-4">
          {data.audioEquipment?.map((audio, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {audio.brand} {audio.model}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Type: {audio.type} | Qty: {audio.quantity}
                  </p>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(audio.totalPrice)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Lighting */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Sunset className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Lighting
          </h3>
        </div>

        <div className="space-y-4">
          {data.lighting?.map((light, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {light.type}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Qty: {light.quantity}
                  </p>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(light.totalPrice)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Software Licenses */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Software Licenses
          </h3>
        </div>

        <div className="space-y-4">
          {data.softwareLicenses?.map((software, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {software.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    License: {software.licenseType}
                  </p>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(software.threeYearCost || 0)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Total */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Total Studio Equipment
          </span>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatCurrency(data.totalStudioEquipment || 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StudioEquipmentCard;
