import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Gift,
  Landmark,
  Building,
  Calendar,
  Edit,
  Save,
  X,
  Trash2,
} from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { useDeleteGrantMutation } from "../../store/api/sponsorsApi";
import { toast } from "react-toastify";

const GrantsCard = ({ data, isEditing, onInputChange, planId, onRefresh }) => {
  const [editingGrant, setEditingGrant] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteGrant] = useDeleteGrantMutation();

  const providerIcons = {
    government: <Landmark className="w-5 h-5" />,
    foundation: <Building className="w-5 h-5" />,
  };

  const providerColors = {
    government: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    foundation: "text-green-600 bg-green-100 dark:bg-green-900/30",
  };

  const handleEdit = (index, grant) => {
    setEditingGrant(index);
    setEditForm({
      name: grant.name,
      provider: grant.provider,
      schemeName: grant.schemeName,
      amount: grant.amount,
      receivedDate: grant.receivedDate,
    });
  };

  const handleSave = async (index) => {
    try {
      await updateGrant({
        id: planId,
        grantIndex: index,
        ...editForm,
      }).unwrap();
      toast.success("Grant updated successfully");
      setEditingGrant(null);
      onRefresh();
    } catch (error) {
      toast.error("Failed to update grant");
    }
  };

  const handleDelete = async (index) => {
    if (window.confirm("Are you sure you want to delete this grant?")) {
      try {
        await deleteGrant({ id: planId, grantIndex: index }).unwrap();
        toast.success("Grant deleted successfully");
        onRefresh();
      } catch (error) {
        toast.error("Failed to delete grant");
      }
    }
  };

  const getTotalByProvider = (provider) => {
    return data
      .filter((g) => g.provider === provider)
      .reduce((sum, g) => sum + g.amount, 0);
  };

  return (
    <div className="space-y-6">
      {/* Provider Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {["government", "foundation"].map((provider) => (
          <div
            key={provider}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center"
          >
            <div
              className={`inline-flex p-2 rounded-lg mb-2 ${providerColors[provider]}`}
            >
              {providerIcons[provider]}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {provider}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {data.filter((g) => g.provider === provider).length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {formatCurrency(getTotalByProvider(provider))}
            </p>
          </div>
        ))}
      </div>

      {/* Grants List */}
      <div className="space-y-4">
        {data.map((grant, index) => (
          <motion.div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {editingGrant === index ? (
              // Edit Mode
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Grant Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Provider
                    </label>
                    <select
                      value={editForm.provider}
                      onChange={(e) =>
                        setEditForm({ ...editForm, provider: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    >
                      <option value="government">Government</option>
                      <option value="foundation">Foundation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Scheme Name
                    </label>
                    <input
                      type="text"
                      value={editForm.schemeName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, schemeName: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={editForm.amount}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          amount: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Received Date
                    </label>
                    <input
                      type="date"
                      value={
                        editForm.receivedDate
                          ? editForm.receivedDate.split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          receivedDate: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handleSave(index)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => setEditingGrant(null)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-lg ${providerColors[grant.provider]}`}
                    >
                      {providerIcons[grant.provider]}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {grant.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {grant.schemeName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(grant.amount)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(grant.receivedDate)}
                      </p>
                    </div>
                    {isEditing && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(index, grant)}
                          className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Total */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Total Grants
          </span>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(data.reduce((sum, g) => sum + g.amount, 0))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GrantsCard;
