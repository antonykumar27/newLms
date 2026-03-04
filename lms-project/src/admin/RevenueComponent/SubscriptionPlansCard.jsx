import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Users,
  TrendingUp,
  Calendar,
  Edit,
  Save,
  X,
  Check,
} from "lucide-react";
import { formatCurrency, formatNumber } from "../../utils/formatters";

const SubscriptionPlansCard = ({ plans, isEditing, onUpdate }) => {
  const [editingPlan, setEditingPlan] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setEditForm({
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      subscribersYear1: plan.projectedSubscribers.year1,
      subscribersYear2: plan.projectedSubscribers.year2,
      subscribersYear3: plan.projectedSubscribers.year3,
    });
  };

  const handleSave = () => {
    // Calculate projected revenue
    const newRevenueYear1 =
      editForm.monthlyPrice * editForm.subscribersYear1 * 12 * 0.8 +
      editForm.yearlyPrice * editForm.subscribersYear1 * 0.2;
    const newRevenueYear2 =
      editForm.monthlyPrice * editForm.subscribersYear2 * 12 * 0.8 +
      editForm.yearlyPrice * editForm.subscribersYear2 * 0.2;
    const newRevenueYear3 =
      editForm.monthlyPrice * editForm.subscribersYear3 * 12 * 0.8 +
      editForm.yearlyPrice * editForm.subscribersYear3 * 0.2;

    // Update plan
    const updatedPlan = {
      ...editingPlan,
      monthlyPrice: editForm.monthlyPrice,
      yearlyPrice: editForm.yearlyPrice,
      projectedSubscribers: {
        year1: editForm.subscribersYear1,
        year2: editForm.subscribersYear2,
        year3: editForm.subscribersYear3,
      },
      projectedRevenue: {
        year1: newRevenueYear1,
        year2: newRevenueYear2,
        year3: newRevenueYear3,
      },
    };

    onUpdate(
      "b2cRevenue",
      "subscriptionPlans",
      plans.map((p) => (p.tier === editingPlan.tier ? updatedPlan : p)),
    );

    setEditingPlan(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Subscription Plans Details
      </h3>

      <div className="space-y-4">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
          >
            {editingPlan?.tier === plan.tier ? (
              // Edit Mode
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Monthly Price (₹)
                    </label>
                    <input
                      type="number"
                      value={editForm.monthlyPrice}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          monthlyPrice: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Yearly Price (₹)
                    </label>
                    <input
                      type="number"
                      value={editForm.yearlyPrice}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          yearlyPrice: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Year 1 Subscribers
                    </label>
                    <input
                      type="number"
                      value={editForm.subscribersYear1}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          subscribersYear1: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Year 2 Subscribers
                    </label>
                    <input
                      type="number"
                      value={editForm.subscribersYear2}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          subscribersYear2: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Year 3 Subscribers
                    </label>
                    <input
                      type="number"
                      value={editForm.subscribersYear3}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          subscribersYear3: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => setEditingPlan(null)}
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
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {plan.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {plan.features.join(" • ")}
                    </p>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => handleEdit(plan)}
                      className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Monthly
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(plan.monthlyPrice)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Yearly
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(plan.yearlyPrice)}
                    </p>
                    <p className="text-xs text-green-600">
                      Save{" "}
                      {(
                        (1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) *
                        100
                      ).toFixed(0)}
                      %
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Subscribers
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      Y1: {formatNumber(plan.projectedSubscribers.year1)} • Y2:{" "}
                      {formatNumber(plan.projectedSubscribers.year2)} • Y3:{" "}
                      {formatNumber(plan.projectedSubscribers.year3)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Revenue
                    </p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(
                        plan.projectedRevenue.year1 +
                          plan.projectedRevenue.year2 +
                          plan.projectedRevenue.year3,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SubscriptionPlansCard;
