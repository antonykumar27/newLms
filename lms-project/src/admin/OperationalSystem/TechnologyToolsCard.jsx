import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Laptop,
  MessageSquare,
  Calendar,
  FileText,
  Trash2,
  Plus,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const TechnologyToolsCard = ({
  data,
  isEditing,
  onInputChange,
  planId,
  onRefresh,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTool, setNewTool] = useState({
    category: "productivity",
    name: "",
    monthlyCost: 0,
  });

  const categoryIcons = {
    productivity: <Laptop className="w-5 h-5" />,
    communication: <MessageSquare className="w-5 h-5" />,
    accounting: <FileText className="w-5 h-5" />,
  };

  const categoryColors = {
    productivity: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    communication: "text-green-600 bg-green-100 dark:bg-green-900/30",
    accounting: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
  };

  const handleAddTool = () => {
    if (newTool.name && newTool.monthlyCost > 0) {
      const category = newTool.category;
      const tools = [
        ...data[`${category}Tools`],
        { name: newTool.name, monthlyCost: newTool.monthlyCost },
      ];
      onInputChange("technologyTools", `${category}Tools`, tools);
      setNewTool({ category: "productivity", name: "", monthlyCost: 0 });
      setShowAddForm(false);
    }
  };

  const handleDeleteTool = (category, index) => {
    const tools = data[`${category}Tools`].filter((_, i) => i !== index);
    onInputChange("technologyTools", `${category}Tools`, tools);
  };

  return (
    <div className="space-y-6">
      {/* Productivity Tools */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {categoryIcons.productivity}
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Productivity Tools
            </h3>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Total:{" "}
            {formatCurrency(
              data.productivityTools.reduce(
                (sum, tool) => sum + tool.monthlyCost,
                0,
              ),
            )}
          </span>
        </div>

        <div className="space-y-3">
          {data.productivityTools.map((tool, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                    {tool.name}
                  </h4>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(tool.monthlyCost)}/mo
                  </span>
                  {isEditing && (
                    <button
                      onClick={() => handleDeleteTool("productivity", index)}
                      className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Communication Tools */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {categoryIcons.communication}
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Communication Tools
            </h3>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Total:{" "}
            {formatCurrency(
              data.communicationTools.reduce(
                (sum, tool) => sum + tool.monthlyCost,
                0,
              ),
            )}
          </span>
        </div>

        <div className="space-y-3">
          {data.communicationTools.map((tool, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                    {tool.name}
                  </h4>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(tool.monthlyCost)}/mo
                  </span>
                  {isEditing && (
                    <button
                      onClick={() => handleDeleteTool("communication", index)}
                      className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Accounting Tools */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {categoryIcons.accounting}
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Accounting Tools
            </h3>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Total:{" "}
            {formatCurrency(
              data.accountingTools.reduce(
                (sum, tool) => sum + tool.monthlyCost,
                0,
              ),
            )}
          </span>
        </div>

        <div className="space-y-3">
          {data.accountingTools.map((tool, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                    {tool.name}
                  </h4>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(tool.monthlyCost)}/mo
                  </span>
                  {isEditing && (
                    <button
                      onClick={() => handleDeleteTool("accounting", index)}
                      className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Add Tool Form */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-amber-500 hover:text-amber-500 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Tool</span>
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Category
                </label>
                <select
                  value={newTool.category}
                  onChange={(e) =>
                    setNewTool({ ...newTool, category: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                >
                  <option value="productivity">Productivity</option>
                  <option value="communication">Communication</option>
                  <option value="accounting">Accounting</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Tool Name
                </label>
                <input
                  type="text"
                  value={newTool.name}
                  onChange={(e) =>
                    setNewTool({ ...newTool, name: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., slack"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Monthly Cost (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newTool.monthlyCost}
                  onChange={(e) =>
                    setNewTool({
                      ...newTool,
                      monthlyCost: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleAddTool}
                  className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
                >
                  Add Tool
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Totals */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Monthly
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.totalMonthly)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total 3 Years
            </p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(data.totalThreeYear)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnologyToolsCard;
