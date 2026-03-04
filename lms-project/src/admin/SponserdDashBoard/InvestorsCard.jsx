import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { useDeleteInvestorMutation } from "../../store/api/sponsorsApi";
import { toast } from "react-toastify";

const InvestorsCard = ({
  data,
  isEditing,
  onInputChange,
  planId,
  onRefresh,
}) => {
  const [expandedInvestor, setExpandedInvestor] = useState(null);
  const [editingInvestor, setEditingInvestor] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteInvestor] = useDeleteInvestorMutation();

  const investorIcons = {
    angel: <User className="w-5 h-5" />,
    vc: <Briefcase className="w-5 h-5" />,
    strategic: <Briefcase className="w-5 h-5" />,
  };

  const investorColors = {
    angel: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    vc: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
    strategic: "text-green-600 bg-green-100 dark:bg-green-900/30",
  };

  const handleEdit = (index, investor) => {
    setEditingInvestor(index);
    setEditForm({
      name: investor.name,
      type: investor.type,
      investmentAmount: investor.investmentAmount,
      equityStake: investor.equityStake,
      investmentDate: investor.investmentDate,
      boardSeat: investor.boardSeat,
      notes: investor.notes || "",
    });
  };

  const handleSave = async (index) => {
    try {
      await updateInvestor({
        id: planId,
        investorIndex: index,
        ...editForm,
      }).unwrap();
      toast.success("Investor updated successfully");
      setEditingInvestor(null);
      onRefresh();
    } catch (error) {
      toast.error("Failed to update investor");
    }
  };

  const handleDelete = async (index) => {
    if (window.confirm("Are you sure you want to delete this investor?")) {
      try {
        await deleteInvestor({ id: planId, investorIndex: index }).unwrap();
        toast.success("Investor deleted successfully");
        onRefresh();
      } catch (error) {
        toast.error("Failed to delete investor");
      }
    }
  };

  const getTotalInvestment = () => {
    return data.reduce((sum, inv) => sum + inv.investmentAmount, 0);
  };

  const getAverageEquity = () => {
    if (data.length === 0) return 0;
    return (
      data.reduce((sum, inv) => sum + (inv.equityStake || 0), 0) / data.length
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Total Investment
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(getTotalInvestment())}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Average Equity
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {getAverageEquity().toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Board Seats
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {data.filter((inv) => inv.boardSeat).length}
          </p>
        </div>
      </div>

      {/* Investors List */}
      <div className="space-y-4">
        {data.map((investor, index) => (
          <motion.div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {editingInvestor === index ? (
              // Edit Mode
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Type
                    </label>
                    <select
                      value={editForm.type}
                      onChange={(e) =>
                        setEditForm({ ...editForm, type: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="angel">Angel</option>
                      <option value="vc">Venture Capital</option>
                      <option value="strategic">Strategic</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Investment Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={editForm.investmentAmount}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          investmentAmount: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Equity Stake (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.equityStake}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          equityStake: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Investment Date
                    </label>
                    <input
                      type="date"
                      value={
                        editForm.investmentDate
                          ? editForm.investmentDate.split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          investmentDate: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Board Seat
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editForm.boardSeat}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            boardSeat: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        Has board seat
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) =>
                      setEditForm({ ...editForm, notes: e.target.value })
                    }
                    rows="2"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
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
                    onClick={() => setEditingInvestor(null)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div>
                <div
                  onClick={() =>
                    setExpandedInvestor(
                      expandedInvestor === index ? null : index,
                    )
                  }
                  className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-2 rounded-lg ${investorColors[investor.type]}`}
                      >
                        {investorIcons[investor.type]}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {investor.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {investor.type} •{" "}
                          {investor.boardSeat ? "Board Seat" : "No Board Seat"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(investor.investmentAmount)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {investor.equityStake}% equity
                        </p>
                      </div>
                      {isEditing && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(index, investor);
                            }}
                            className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(index);
                            }}
                            className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {expandedInvestor === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedInvestor === index && (
                  <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Investment Date
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatDate(investor.investmentDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Board Seat
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {investor.boardSeat ? (
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-1" /> Yes
                            </span>
                          ) : (
                            <span className="flex items-center text-gray-500">
                              <XCircle className="w-4 h-4 mr-1" /> No
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {investor.notes && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Notes
                        </p>
                        <p className="text-gray-900 dark:text-white">
                          {investor.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default InvestorsCard;
