import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Crown,
  Medal,
  Trophy,
  Star,
  Mail,
  Phone,
  Globe,
  Calendar,
  Eye,
  Edit,
  Save,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { useDeleteSponsorMutation } from "../../store/api/sponsorsApi";
import { toast } from "react-toastify";

const SponsorsCard = ({
  data,
  isEditing,
  onInputChange,
  onViewSponsor,
  planId,
  onRefresh,
}) => {
  const [expandedSponsor, setExpandedSponsor] = useState(null);
  const [editingSponsor, setEditingSponsor] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteSponsor] = useDeleteSponsorMutation();

  const tierIcons = {
    platinum: <Crown className="w-5 h-5" />,
    gold: <Trophy className="w-5 h-5" />,
    silver: <Medal className="w-5 h-5" />,
    bronze: <Star className="w-5 h-5" />,
  };

  const tierColors = {
    platinum: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
    gold: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
    silver: "text-gray-600 bg-gray-100 dark:bg-gray-700",
    bronze: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
  };

  const handleEdit = (index, sponsor) => {
    setEditingSponsor(index);
    setEditForm({
      name: sponsor.name,
      tier: sponsor.tier,
      contributionAmount: sponsor.contributionAmount,
      contributionType: sponsor.contributionType,
      website: sponsor.website || "",
      startDate: sponsor.startDate,
      endDate: sponsor.endDate,
      renewalOption: sponsor.renewalOption,
      contactPerson: {
        name: sponsor.contactPerson?.name || "",
        email: sponsor.contactPerson?.email || "",
        phone: sponsor.contactPerson?.phone || "",
      },
    });
  };

  const handleSave = async (index) => {
    try {
      await updateSponsor({
        id: planId,
        sponsorIndex: index,
        ...editForm,
      }).unwrap();
      toast.success("Sponsor updated successfully");
      setEditingSponsor(null);
      onRefresh();
    } catch (error) {
      toast.error("Failed to update sponsor");
    }
  };

  const handleDelete = async (index) => {
    if (window.confirm("Are you sure you want to delete this sponsor?")) {
      try {
        await deleteSponsor({ id: planId, sponsorIndex: index }).unwrap();
        toast.success("Sponsor deleted successfully");
        onRefresh();
      } catch (error) {
        toast.error("Failed to delete sponsor");
      }
    }
  };

  const getTotalByTier = (tier) => {
    return data
      .filter((s) => s.tier === tier)
      .reduce((sum, s) => sum + s.contributionAmount, 0);
  };

  const getActiveSponsors = () => {
    const now = new Date();
    return data.filter((s) => new Date(s.endDate) > now).length;
  };

  return (
    <div className="space-y-6">
      {/* Tier Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {["platinum", "gold", "silver", "bronze"].map((tier) => (
          <div
            key={tier}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center"
          >
            <div
              className={`inline-flex p-2 rounded-lg mb-2 ${tierColors[tier]}`}
            >
              {tierIcons[tier]}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {tier}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {data.filter((s) => s.tier === tier).length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {formatCurrency(getTotalByTier(tier))}
            </p>
          </div>
        ))}
      </div>

      {/* Sponsors List */}
      <div className="space-y-4">
        {data.map((sponsor, index) => (
          <motion.div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {editingSponsor === index ? (
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
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Tier
                    </label>
                    <select
                      value={editForm.tier}
                      onChange={(e) =>
                        setEditForm({ ...editForm, tier: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="platinum">Platinum</option>
                      <option value="gold">Gold</option>
                      <option value="silver">Silver</option>
                      <option value="bronze">Bronze</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Contribution Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={editForm.contributionAmount}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          contributionAmount: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Contribution Type
                    </label>
                    <select
                      value={editForm.contributionType}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          contributionType: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="cash">Cash</option>
                      <option value="kind">In Kind</option>
                      <option value="services">Services</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={editForm.website}
                    onChange={(e) =>
                      setEditForm({ ...editForm, website: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={
                        editForm.startDate
                          ? editForm.startDate.split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setEditForm({ ...editForm, startDate: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={
                        editForm.endDate ? editForm.endDate.split("T")[0] : ""
                      }
                      onChange={(e) =>
                        setEditForm({ ...editForm, endDate: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editForm.renewalOption}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          renewalOption: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Renewal Option
                    </span>
                  </label>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Contact Person
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={editForm.contactPerson.name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          contactPerson: {
                            ...editForm.contactPerson,
                            name: e.target.value,
                          },
                        })
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={editForm.contactPerson.email}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          contactPerson: {
                            ...editForm.contactPerson,
                            email: e.target.value,
                          },
                        })
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={editForm.contactPerson.phone}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          contactPerson: {
                            ...editForm.contactPerson,
                            phone: e.target.value,
                          },
                        })
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
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
                    onClick={() => setEditingSponsor(null)}
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
                    setExpandedSponsor(expandedSponsor === index ? null : index)
                  }
                  className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {sponsor.logo ? (
                        <img
                          src={sponsor.logo}
                          alt={sponsor.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div
                          className={`p-2 rounded-lg ${tierColors[sponsor.tier]}`}
                        >
                          {tierIcons[sponsor.tier]}
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {sponsor.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {sponsor.tier} • {sponsor.contributionType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(sponsor.contributionAmount)}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatDate(sponsor.startDate)} -{" "}
                          {formatDate(sponsor.endDate)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewSponsor(sponsor);
                          }}
                          className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isEditing && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(index, sponsor);
                              }}
                              className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
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
                          </>
                        )}
                      </div>
                      {expandedSponsor === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedSponsor === index && (
                  <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Benefits
                        </p>
                        <ul className="space-y-1">
                          {sponsor.benefitsProvided?.map((benefit, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-900 dark:text-white flex items-center"
                            >
                              <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2"></span>
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Contact Person
                        </p>
                        {sponsor.contactPerson && (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-900 dark:text-white flex items-center">
                              <User className="w-4 h-4 mr-2 text-gray-500" />
                              {sponsor.contactPerson.name}
                            </p>
                            <p className="text-sm text-gray-900 dark:text-white flex items-center">
                              <Mail className="w-4 h-4 mr-2 text-gray-500" />
                              {sponsor.contactPerson.email}
                            </p>
                            <p className="text-sm text-gray-900 dark:text-white flex items-center">
                              <Phone className="w-4 h-4 mr-2 text-gray-500" />
                              {sponsor.contactPerson.phone}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Year 1
                        </p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(sponsor.sponsorshipYear1)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Year 2
                        </p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(sponsor.sponsorshipYear2)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Year 3
                        </p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(sponsor.sponsorshipYear3)}
                        </p>
                      </div>
                    </div>
                    {sponsor.website && (
                      <div className="mt-4">
                        <a
                          href={sponsor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center"
                        >
                          <Globe className="w-4 h-4 mr-1" />
                          {sponsor.website}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Sponsors
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {data.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Active
            </p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {getActiveSponsors()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total 3Y
            </p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(
                data.reduce((sum, s) => sum + s.contributionAmount, 0),
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Avg Contribution
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(
                data.reduce((sum, s) => sum + s.contributionAmount, 0) /
                  data.length || 0,
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorsCard;
