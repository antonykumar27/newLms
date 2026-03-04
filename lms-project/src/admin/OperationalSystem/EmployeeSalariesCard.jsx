import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserCog,
  UserRound,
  Briefcase,
  TrendingUp,
  Eye,
  EyeOff,
  Edit,
  Save,
  X,
} from "lucide-react";
import { formatCurrency, formatNumber } from "../../utils/formatters";

const EmployeeSalariesCard = ({
  data,
  totalMonthly,
  isEditing,
  onInputChange,
}) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState({});

  const departmentIcons = {
    management: <UserCog className="w-5 h-5" />,
    admin: <UserRound className="w-5 h-5" />,
    finance: <Briefcase className="w-5 h-5" />,
    techSupport: <Users className="w-5 h-5" />,
  };

  const departmentColors = {
    management: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
    admin: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    finance: "text-green-600 bg-green-100 dark:bg-green-900/30",
    techSupport: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
  };

  const handleEdit = (index, employee) => {
    setEditingIndex(index);
    setEditForm({
      role: employee.role,
      count: employee.count,
      monthlySalary: employee.monthlySalary,
      benefits: employee.benefits,
    });
  };

  const handleSave = (index) => {
    const newData = [...data];
    newData[index] = {
      ...newData[index],
      ...editForm,
      totalCompensation: editForm.monthlySalary + editForm.benefits,
    };
    onInputChange("employeeSalaries", newData);
    setEditingIndex(null);
  };

  const calculateDepartmentTotal = (dept) => {
    return dept.totalCompensation * dept.count;
  };

  return (
    <div className="space-y-6">
      {/* Department Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {["management", "techSupport", "admin", "finance"].map((dept) => {
          const deptEmployees = data.filter((e) => e.department === dept);
          const deptTotal = deptEmployees.reduce(
            (sum, e) => sum + e.totalCompensation * e.count,
            0,
          );
          const deptCount = deptEmployees.reduce((sum, e) => sum + e.count, 0);

          return (
            <motion.div
              key={dept}
              whileHover={{ y: -2 }}
              className={`rounded-xl p-4 ${departmentColors[dept]}`}
            >
              <div className="flex items-center justify-between mb-2">
                {departmentIcons[dept]}
                <span className="text-xs font-medium">
                  {deptCount} {deptCount === 1 ? "person" : "people"}
                </span>
              </div>
              <p className="text-sm font-medium capitalize">{dept}</p>
              <p className="text-lg font-bold mt-1">
                {formatCurrency(deptTotal)}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Employee List */}
      <div className="space-y-4">
        {data.map((employee, index) => (
          <motion.div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
          >
            {editingIndex === index ? (
              // Edit Mode
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={editForm.role}
                      onChange={(e) =>
                        setEditForm({ ...editForm, role: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Count
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.count}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          count: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Monthly Salary (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.monthlySalary}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          monthlySalary: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Benefits (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.benefits}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          benefits: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handleSave(index)}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => setEditingIndex(null)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-lg ${departmentColors[employee.department]}`}
                  >
                    {departmentIcons[employee.department]}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {employee.role}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {employee.department} • {employee.count}{" "}
                      {employee.count === 1 ? "person" : "people"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Per Person
                    </p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(employee.totalCompensation)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Department Total
                    </p>
                    <p className="font-bold text-amber-600 dark:text-amber-400">
                      {formatCurrency(calculateDepartmentTotal(employee))}
                    </p>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => handleEdit(index, employee)}
                      className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
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
            Total Monthly Salary
          </span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {formatCurrency(totalMonthly)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSalariesCard;
