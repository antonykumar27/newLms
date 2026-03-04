import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  FileText,
  Award,
  Briefcase,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Github,
  Twitter,
  ExternalLink,
  Shield,
  GraduationCap,
  AlertCircle,
  User,
  Calendar,
  DollarSign,
  MessageSquare,
  Loader2,
  Moon, // New icon for dark mode toggle
  Sun, // New icon for light mode toggle
  User2, // Using a modern user icon
} from "lucide-react";

// Assuming you have implemented the ThemeContext and useTheme hook
// import { useTheme } from "./ThemeContext"; // Adjust path as needed

// A generic Card component to reduce repetition and add stylish effects
const DetailCard = ({ icon: Icon, title, children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 ${className}`}
  >
    <h4 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
      <Icon className="w-6 h-6 mr-3 text-orange-500" />
      {title}
    </h4>
    {children}
  </div>
);

function TeacherApplicationAcceptOrRemove({
  detailsLoading,
  appDetails,
  getStatusBadge, // Passed in from the outside
  onClose,
  onApprove,
  onReject,
  isProcessing,
}) {
  const [notes, setNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showApproveForm, setShowApproveForm] = useState(false);

  // Use the theme context for dark mode support
  // const { theme, toggleTheme } = useTheme();

  const handleApproveClick = () => {
    if (appDetails?.data?.applicationStatus === "pending") {
      setShowApproveForm(true);
      setShowRejectForm(false);
    }
  };

  const handleRejectClick = () => {
    if (appDetails?.data?.applicationStatus === "pending") {
      setShowRejectForm(true);
      setShowApproveForm(false);
    }
  };

  const submitApprove = () => {
    if (onApprove && appDetails?.data?._id) {
      onApprove(appDetails.data._id, notes);
      // Keep modal open while processing, close on success in parent handler
      // setShowApproveForm(false);
      // setNotes("");
    }
  };

  const submitReject = () => {
    // Note: The original code passed a hardcoded message as the third argument.
    // Assuming the parent component handles the full message construction based on the reason.
    if (onReject && appDetails?.data?._id && rejectReason.trim()) {
      onReject(
        appDetails.data._id,
        rejectReason,
        "Please improve your qualifications and reapply.", // Placeholder message
      );
      // Keep modal open while processing, close on success in parent handler
      // setShowRejectForm(false);
      // setRejectReason("");
    }
  };

  const cancelAction = () => {
    setShowApproveForm(false);
    setShowRejectForm(false);
    setNotes("");
    setRejectReason("");
  };

  const application = appDetails?.data;
  const teacherProfile = application;

  // Render for error/not found
  if (!application && !detailsLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl">
          <div className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Application Not Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              The requested application could not be loaded. Please check the
              ID.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-orange-600 text-white rounded-xl shadow-md hover:bg-orange-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Modal Content
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-300">
        {/* Modal Header (Sticky) */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 z-10 rounded-t-3xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                Application Review
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Comprehensive details and action panel for the teacher
                application.
              </p>
            </div>
            {/* <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-3 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition duration-200"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-6 h-6" />
                ) : (
                  <Moon className="w-6 h-6" />
                )}
              </button>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="p-3 text-gray-500 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition duration-200 disabled:opacity-50"
                aria-label="Close Modal"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div> */}
          </div>
        </div>

        {/* Modal Content */}
        {detailsLoading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <Loader2 className="w-14 h-14 text-orange-500 animate-spin mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Loading application details...
            </p>
          </div>
        ) : application ? (
          <div className="p-8">
            {/* Applicant Header Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-200 dark:border-gray-700 shadow-md">
              <div className="flex flex-col md:flex-row md:items-start">
                <div className="flex items-start mb-4 md:mb-0 md:mr-8 flex-shrink-0">
                  <div className="w-24 h-24 bg-orange-200 dark:bg-orange-700 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-white dark:border-gray-900">
                    {application ? (
                      <img
                        src={application.user?.media || ""}
                        alt={application.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User2 className="w-12 h-12 text-orange-600 dark:text-orange-200" />
                    )}
                  </div>

                  <div className="ml-4 flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                      {application.user.name}
                    </h3>

                    <div className="flex items-center mt-2 flex-wrap gap-2">
                      {getStatusBadge(teacherProfile.applicationStatus)}
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Applied:{" "}
                        {new Date(
                          application.application.submittedAt,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 border-l pl-4 border-gray-200 dark:border-gray-700 md:ml-4 pt-4 md:pt-0">
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Mail className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Email
                      </p>
                      <a
                        href={`mailto:${application.user.email}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm truncate block"
                      >
                        {application.user.email}
                      </a>
                    </div>
                  </div>
                  {application.phone && (
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <Phone className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Phone
                        </p>
                        <span className="text-sm">{application.phone}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <DollarSign className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Hourly Rate
                      </p>
                      <span className="font-semibold text-base text-green-600 dark:text-green-400">
                        ${teacherProfile.payment.hourlyRate || 0}/hr
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Briefcase className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Experience
                      </p>
                      <span className="text-sm">
                        {teacherProfile.profile?.experience?.length ?? 0}{" "}
                        position(s)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Sections (Main Content) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column (Details) - Wider */}
              <div className="lg:col-span-2 space-y-6">
                {/* Bio */}
                <DetailCard icon={FileText} title="Bio & Introduction">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line text-base leading-relaxed">
                    {teacherProfile.profile.bio ||
                      "No detailed bio provided by the applicant."}
                  </p>
                </DetailCard>

                {/* Expertise */}
                {teacherProfile.profile.expertise?.length > 0 && (
                  <DetailCard icon={Award} title="Areas of Expertise">
                    <div className="flex flex-wrap gap-3">
                      {teacherProfile.profile.expertise.map((skill, index) => (
                        <span
                          key={skill._id || index}
                          className="px-4 py-2 bg-blue-500/10 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-500/20 transition duration-200"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </DetailCard>
                )}

                {/* Qualifications */}
                {/* Qualifications */}
                {teacherProfile.profile?.qualifications?.length > 0 && (
                  <DetailCard
                    icon={GraduationCap}
                    title="Academic Qualifications"
                  >
                    <div className="space-y-4">
                      {teacherProfile.profile.qualifications.map(
                        (qual, index) => (
                          <div
                            key={qual._id || index}
                            className="p-4 bg-gray-50 dark:bg-gray-800 border-l-4 border-orange-500 rounded-lg shadow-sm"
                          >
                            <h5 className="font-bold text-gray-900 dark:text-gray-100">
                              {qual.degree}
                            </h5>

                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                              {qual.institution} • {qual.year}
                            </p>

                            {qual.certificateUrl && (
                              <a
                                href={qual.certificateUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-orange-600 dark:text-orange-400 hover:text-orange-700 text-xs mt-2 inline-flex items-center font-medium transition duration-200"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View Certificate
                              </a>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </DetailCard>
                )}

                {/* Experience */}
                {teacherProfile?.profile?.experience?.length > 0 && (
                  <DetailCard icon={Briefcase} title="Work Experience">
                    <div className="space-y-4">
                      {teacherProfile.profile.experience.map((exp) => (
                        <div
                          key={exp._id}
                          className="p-4 bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-500 rounded-lg shadow-sm"
                        >
                          <h5 className="font-bold text-gray-900 dark:text-gray-100">
                            {exp.position}
                          </h5>

                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {exp.organization}
                          </p>

                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {new Date(exp.startDate).toLocaleDateString()} –{" "}
                            {exp.currentlyWorking || !exp.endDate
                              ? "Present"
                              : new Date(exp.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </DetailCard>
                )}
              </div>

              {/* Right Column (Actions & Metadata) - Narrower */}
              <div className="space-y-6">
                {/* Application Status Card */}
                <DetailCard icon={AlertCircle} title="Application Timeline">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                        Status:
                      </span>
                      {getStatusBadge(teacherProfile.applicationStatus)}
                    </div>

                    <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex justify-between">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-500" />{" "}
                          Applied:
                        </span>
                        <span className="font-medium">
                          {new Date(
                            teacherProfile.application.submittedAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {teacherProfile.approvalDate && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                          <span className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" /> Approved:
                          </span>
                          <span className="font-medium">
                            {new Date(
                              teacherProfile.approvalDate,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {teacherProfile.rejectionDate && (
                        <div className="flex justify-between text-red-600 dark:text-red-400">
                          <span className="flex items-center">
                            <XCircle className="w-4 h-4 mr-2" /> Rejected:
                          </span>
                          <span className="font-medium">
                            {new Date(
                              teacherProfile.rejectionDate,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </DetailCard>

                {/* Action Buttons (Pending Status) */}
                {teacherProfile.applicationStatus === "pending" && (
                  <DetailCard icon={Shield} title="Reviewer Actions">
                    {/* Approve Form */}
                    {showApproveForm ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <MessageSquare className="w-4 h-4 inline mr-1 text-green-600" />
                            Approval Notes (Optional)
                          </label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add congratulatory message or internal notes..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                          />
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={submitApprove}
                            disabled={isProcessing}
                            className="flex-1 py-3 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 font-semibold flex items-center justify-center disabled:opacity-50 transition duration-200"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Confirm Approval
                              </>
                            )}
                          </button>
                          <button
                            onClick={cancelAction}
                            disabled={isProcessing}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : showRejectForm ? (
                      /* Reject Form */
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <MessageSquare className="w-4 h-4 inline mr-1 text-red-600" />
                            Reason for Rejection *
                          </label>
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Please provide detailed reason for rejection..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200"
                            required
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            This reason will be shared with the applicant.
                          </p>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={submitReject}
                            disabled={isProcessing || !rejectReason.trim()}
                            className="flex-1 py-3 bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 font-semibold flex items-center justify-center disabled:opacity-50 transition duration-200"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5 mr-2" />
                                Confirm Rejection
                              </>
                            )}
                          </button>
                          <button
                            onClick={cancelAction}
                            disabled={isProcessing}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Default Action Buttons */
                      <div className="space-y-4">
                        <button
                          onClick={handleApproveClick}
                          disabled={isProcessing}
                          className="w-full py-3 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 font-bold flex items-center justify-center disabled:opacity-50 transform hover:scale-[1.01] transition duration-200"
                        >
                          <CheckCircle className="w-5 h-5 mr-3" />
                          Approve Application
                        </button>
                        <button
                          onClick={handleRejectClick}
                          disabled={isProcessing}
                          className="w-full py-3 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 font-bold flex items-center justify-center disabled:opacity-50 transform hover:scale-[1.01] transition duration-200"
                        >
                          <XCircle className="w-5 h-5 mr-3" />
                          Reject Application
                        </button>
                      </div>
                    )}
                  </DetailCard>
                )}
                {/* Already Processed Status */}
                {teacherProfile.applicationStatus !== "pending" && (
                  <div
                    className={`border rounded-xl p-6 transition-all duration-300 ${
                      teacherProfile.applicationStatus === "approved"
                        ? "bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                        : "bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                    }`}
                  >
                    <h4 className="text-xl font-bold mb-4 flex items-center">
                      {teacherProfile.applicationStatus === "approved" ? (
                        <>
                          <CheckCircle className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" />
                          Application Approved!
                        </>
                      ) : (
                        <>
                          <XCircle className="w-6 h-6 mr-2 text-red-600 dark:text-red-400" />
                          Application Rejected
                        </>
                      )}
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {teacherProfile.applicationStatus === "approved"
                        ? "This application has been successfully approved. The teacher can now set up their profile and courses."
                        : "This application was previously rejected. The applicant can reapply after 30 days based on policy."}
                    </p>
                    {teacherProfile.applicationStatus === "rejected" &&
                      teacherProfile.rejectionReason && (
                        <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-inner">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Reviewer Rejection Reason:
                          </p>
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1 italic">
                            {teacherProfile.rejectionReason}
                          </p>
                        </div>
                      )}
                  </div>
                )}
                {/* Social Links */}
                {(teacherProfile.social?.linkedin ||
                  teacherProfile.social?.github ||
                  teacherProfile.social?.twitter ||
                  teacherProfile.social?.website) && (
                  <DetailCard icon={Globe} title="Online Presence">
                    <div className="space-y-3">
                      {teacherProfile.social?.linkedin && (
                        <a
                          href={teacherProfile.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition duration-200 text-sm font-medium"
                        >
                          <Linkedin className="w-5 h-5 mr-3 text-blue-500" />
                          LinkedIn Profile{" "}
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </a>
                      )}
                      {teacherProfile.social?.github && (
                        <a
                          href={teacherProfile.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-800 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition duration-200 text-sm font-medium"
                        >
                          <Github className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                          GitHub Profile{" "}
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </a>
                      )}
                      {teacherProfile.social?.twitter && (
                        <a
                          href={teacherProfile.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sky-600 dark:text-sky-400 hover:text-sky-800 transition text-sm font-medium"
                        >
                          <Twitter className="w-5 h-5 mr-3" />
                          Twitter Profile
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </a>
                      )}

                      {teacherProfile.social?.website && (
                        <a
                          href={teacherProfile.social.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition duration-200 text-sm font-medium"
                        >
                          <Globe className="w-5 h-5 mr-3 text-orange-500" />
                          Personal Website{" "}
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </a>
                      )}
                    </div>
                  </DetailCard>
                )}

                {/* Attachments */}
                <DetailCard icon={FileText} title="Document Attachments">
                  <div className="space-y-3">
                    {/* Resume */}
                    {teacherProfile?.resume?.[0]?.url && (
                      <a
                        href={teacherProfile?.resume[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition duration-200 text-sm font-medium"
                      >
                        <FileText className="w-5 h-5 mr-3" />
                        View Resume <ExternalLink className="w-3 h-3 ml-2" />
                      </a>
                    )}

                    {/* ID Proof */}
                    {teacherProfile.idProof?.[0]?.url && (
                      <a
                        href={teacherProfile.idProof[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition duration-200 text-sm font-medium"
                      >
                        <Shield className="w-5 h-5 mr-3" />
                        View ID Proof <ExternalLink className="w-3 h-3 ml-2" />
                      </a>
                    )}

                    {/* Other Media - This might be teacherProfile.media OR teacherProfile.documents.additionalDocuments */}
                    {(
                      teacherProfile.media ||
                      teacherProfile.documents?.additionalDocuments
                    )?.map((file, index) => (
                      <a
                        key={index}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition duration-200 text-sm font-medium"
                      >
                        <FileText className="w-5 h-5 mr-3" />
                        {file.filename || `Document ${index + 1}`}
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </a>
                    ))}

                    {!teacherProfile.resume?.[0]?.url &&
                      !teacherProfile.idProof?.[0]?.url &&
                      !teacherProfile.media?.length &&
                      !teacherProfile.documents?.additionalDocuments
                        ?.length && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          No documents provided.
                        </p>
                      )}
                  </div>
                </DetailCard>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default TeacherApplicationAcceptOrRemove;
