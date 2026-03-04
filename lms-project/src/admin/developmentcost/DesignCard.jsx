import React from "react";
import { motion } from "framer-motion";
import {
  Palette,
  PenTool,
  Brush,
  Image,
  Type,
  Layout,
  Smartphone,
  Globe,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const DesignCard = ({ data, isEditing, onInputChange }) => {
  return (
    <div className="space-y-6">
      {/* Web Design */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Web Design
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Wireframing
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.webDesign.wireframing.hours}
                onChange={(e) =>
                  onInputChange(
                    "design",
                    "webDesign",
                    "wireframing",
                    "hours",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Hours"
              />
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(data.webDesign.wireframing.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.webDesign.wireframing.hours} hrs
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Prototyping
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.webDesign.prototyping.hours}
                onChange={(e) =>
                  onInputChange(
                    "design",
                    "webDesign",
                    "prototyping",
                    "hours",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Hours"
              />
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(data.webDesign.prototyping.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.webDesign.prototyping.hours} hrs
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              UI Kits
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="number"
                  value={data.webDesign.uiKits.purchase}
                  onChange={(e) =>
                    onInputChange(
                      "design",
                      "webDesign",
                      "uiKits",
                      "purchase",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Purchase"
                />
                <input
                  type="number"
                  value={data.webDesign.uiKits.customization}
                  onChange={(e) =>
                    onInputChange(
                      "design",
                      "webDesign",
                      "uiKits",
                      "customization",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Customization"
                />
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(
                    data.webDesign.uiKits.purchase +
                      data.webDesign.uiKits.customization,
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Purchase: {formatCurrency(data.webDesign.uiKits.purchase)} •
                  Custom: {formatCurrency(data.webDesign.uiKits.customization)}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Responsive Mockups
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.webDesign.responsiveMockups.hours}
                onChange={(e) =>
                  onInputChange(
                    "design",
                    "webDesign",
                    "responsiveMockups",
                    "hours",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Hours"
              />
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(data.webDesign.responsiveMockups.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.webDesign.responsiveMockups.hours} hrs
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Web Design Subtotal
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.webDesign.subTotal)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Mobile Design */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Mobile Design
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              iOS HIG
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.mobileDesign.iosHIG.hours}
                onChange={(e) =>
                  onInputChange(
                    "design",
                    "mobileDesign",
                    "iosHIG",
                    "hours",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                placeholder="Hours"
              />
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(data.mobileDesign.iosHIG.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.mobileDesign.iosHIG.hours} hrs
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Material Design
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.mobileDesign.materialDesign.hours}
                onChange={(e) =>
                  onInputChange(
                    "design",
                    "mobileDesign",
                    "materialDesign",
                    "hours",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                placeholder="Hours"
              />
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(data.mobileDesign.materialDesign.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.mobileDesign.materialDesign.hours} hrs
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              App Icons
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="number"
                  value={data.mobileDesign.appIcons.design}
                  onChange={(e) =>
                    onInputChange(
                      "design",
                      "mobileDesign",
                      "appIcons",
                      "design",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                  placeholder="Design"
                />
                <input
                  type="number"
                  value={data.mobileDesign.appIcons.variants}
                  onChange={(e) =>
                    onInputChange(
                      "design",
                      "mobileDesign",
                      "appIcons",
                      "variants",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                  placeholder="Variants"
                />
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(
                    data.mobileDesign.appIcons.design +
                      data.mobileDesign.appIcons.variants,
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Design: {formatCurrency(data.mobileDesign.appIcons.design)} •
                  Variants:{" "}
                  {formatCurrency(data.mobileDesign.appIcons.variants)}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Splash Screens
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.mobileDesign.splashScreens.design}
                onChange={(e) =>
                  onInputChange(
                    "design",
                    "mobileDesign",
                    "splashScreens",
                    "design",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                placeholder="Design"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.mobileDesign.splashScreens.total)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Mobile Design Subtotal
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.mobileDesign.subTotal)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Branding */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Branding
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Logo Design
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="number"
                  value={data.branding.logo.design}
                  onChange={(e) =>
                    onInputChange(
                      "design",
                      "branding",
                      "logo",
                      "design",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="Design"
                />
                <input
                  type="number"
                  value={data.branding.logo.revisions}
                  onChange={(e) =>
                    onInputChange(
                      "design",
                      "branding",
                      "logo",
                      "revisions",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="Revisions"
                />
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(
                    data.branding.logo.design + data.branding.logo.revisions,
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Design: {formatCurrency(data.branding.logo.design)} •
                  Revisions: {formatCurrency(data.branding.logo.revisions)}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Color Palette
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.branding.colorPalette.development}
                onChange={(e) =>
                  onInputChange(
                    "design",
                    "branding",
                    "colorPalette",
                    "development",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                placeholder="Development"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.branding.colorPalette.development)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Typography
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.branding.typography.licensing}
                onChange={(e) =>
                  onInputChange(
                    "design",
                    "branding",
                    "typography",
                    "licensing",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                placeholder="Licensing"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.branding.typography.licensing)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Brand Guidelines
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.branding.brandGuidelines.creation}
                onChange={(e) =>
                  onInputChange(
                    "design",
                    "branding",
                    "brandGuidelines",
                    "creation",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                placeholder="Creation"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.branding.brandGuidelines.creation)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Branding Subtotal
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.branding.subTotal)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Total Design */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Design Total
          </span>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatCurrency(data.totalDesign)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DesignCard;
