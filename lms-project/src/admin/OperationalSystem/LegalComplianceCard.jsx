import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  FileCheck,
  Shield,
  ShieldCheck,
  Gavel,
  Award,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const LegalComplianceCard = ({ data, isEditing, onInputChange }) => {
  const [editingTrademark, setEditingTrademark] = useState(null);
  const [trademarkForm, setTrademarkForm] = useState({ name: "", cost: 0 });

  const handleAddTrademark = () => {
    if (trademarkForm.name && trademarkForm.cost > 0) {
      const newTrademarks = [...(data.trademarks || []), trademarkForm];
      onInputChange("legalCompliance", "trademarks", newTrademarks);
      setTrademarkForm({ name: "", cost: 0 });
    }
  };

  const handleRemoveTrademark = (index) => {
    const newTrademarks = data.trademarks.filter((_, i) => i !== index);
    onInputChange("legalCompliance", "trademarks", newTrademarks);
  };

  return (
    <div className="space-y-6">
      {/* Registrations */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Registrations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Company Registration
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.companyRegistration?.oneTime || 0}
                onChange={(e) =>
                  onInputChange(
                    "legalCompliance",
                    "companyRegistration",
                    "oneTime",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.companyRegistration?.oneTime || 0)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              GST Registration
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.gstRegistration?.oneTime || 0}
                onChange={(e) =>
                  onInputChange(
                    "legalCompliance",
                    "gstRegistration",
                    "oneTime",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.gstRegistration?.oneTime || 0)}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Trademarks */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Trademarks
            </h3>
          </div>
          {isEditing && (
            <button
              onClick={handleAddTrademark}
              className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {isEditing && (
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              placeholder="Trademark name"
              value={trademarkForm.name}
              onChange={(e) =>
                setTrademarkForm({ ...trademarkForm, name: e.target.value })
              }
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="number"
              placeholder="Cost"
              value={trademarkForm.cost}
              onChange={(e) =>
                setTrademarkForm({
                  ...trademarkForm,
                  cost: parseInt(e.target.value) || 0,
                })
              }
              className="w-32 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}

        <div className="space-y-3">
          {data.trademarks?.map((trademark, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {trademark.name}
                </h4>
                <div className="flex items-center space-x-4">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(trademark.cost)}
                  </span>
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveTrademark(index)}
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

      {/* Legal Retainers */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Gavel className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Legal Retainers
          </h3>
        </div>

        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
            Monthly Retainer
          </label>
          {isEditing ? (
            <input
              type="number"
              value={data.legalRetainers?.monthly || 0}
              onChange={(e) =>
                onInputChange(
                  "legalCompliance",
                  "legalRetainers",
                  "monthly",
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            />
          ) : (
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {formatCurrency(data.legalRetainers?.monthly || 0)}
            </p>
          )}
        </div>
      </motion.div>

      {/* Insurance */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Insurance
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Professional Indemnity
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.insurance?.professionalIndemnity?.yearly || 0}
                onChange={(e) =>
                  onInputChange(
                    "legalCompliance",
                    "insurance",
                    "professionalIndemnity",
                    {
                      yearly: parseInt(e.target.value) || 0,
                    },
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(
                  data.insurance?.professionalIndemnity?.yearly || 0,
                )}
                /year
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Cyber Liability
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.insurance?.cyberLiability?.yearly || 0}
                onChange={(e) =>
                  onInputChange(
                    "legalCompliance",
                    "insurance",
                    "cyberLiability",
                    {
                      yearly: parseInt(e.target.value) || 0,
                    },
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.insurance?.cyberLiability?.yearly || 0)}
                /year
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Totals */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Yearly
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.totalYearly)}
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

export default LegalComplianceCard;
