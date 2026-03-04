// components/StudyReminder.jsx
import React, { useState, useEffect } from "react";
import {
  BellIcon,
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { BellAlertIcon } from "@heroicons/react/24/solid";

const StudyReminder = ({ streak = 0, lastActive = null }) => {
  const [showReminder, setShowReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState("19:00"); // Default 7 PM
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [snoozedUntil, setSnoozedUntil] = useState(null);

  // Check if user has been inactive
  useEffect(() => {
    if (lastActive) {
      const lastActiveDate = new Date(lastActive);
      const today = new Date();
      const daysInactive = Math.floor(
        (today - lastActiveDate) / (1000 * 60 * 60 * 24),
      );

      // Show reminder if inactive for more than 1 day
      if (daysInactive >= 1 && reminderEnabled) {
        setShowReminder(true);
      }
    }
  }, [lastActive, reminderEnabled]);

  // Check scheduled reminders
  useEffect(() => {
    if (!reminderEnabled) return;

    const checkReminder = () => {
      if (snoozedUntil && new Date() < new Date(snoozedUntil)) return;

      const now = new Date();
      const [hours, minutes] = reminderTime.split(":").map(Number);
      const reminderDateTime = new Date();
      reminderDateTime.setHours(hours, minutes, 0, 0);

      // If reminder time has passed today, schedule for tomorrow
      if (now > reminderDateTime) {
        reminderDateTime.setDate(reminderDateTime.getDate() + 1);
      }

      const timeUntilReminder = reminderDateTime - now;

      const timer = setTimeout(() => {
        setShowReminder(true);
      }, timeUntilReminder);

      return () => clearTimeout(timer);
    };

    checkReminder();
  }, [reminderEnabled, reminderTime, snoozedUntil]);

  const handleSnooze = (minutes = 30) => {
    const snoozeTime = new Date();
    snoozeTime.setMinutes(snoozeTime.getMinutes() + minutes);
    setSnoozedUntil(snoozeTime);
    setShowReminder(false);
  };

  const handleComplete = () => {
    setShowReminder(false);
    // You could track this completion in your analytics
  };

  if (!showReminder) {
    // Mini reminder toggle in corner
    return (
      <button
        onClick={() => setReminderEnabled(!reminderEnabled)}
        className={`fixed bottom-4 right-4 p-3 rounded-full shadow-lg transition-all z-50 ${
          reminderEnabled
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
        }`}
      >
        {reminderEnabled ? (
          <BellAlertIcon className="h-5 w-5" />
        ) : (
          <BellIcon className="h-5 w-5" />
        )}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AcademicCapIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Time to Study!
            </h3>
          </div>
          <button
            onClick={() => setShowReminder(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Streak Info */}
          <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-4 text-white mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Current Streak</p>
                <p className="text-3xl font-bold">{streak} days</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Keep it up!</p>
                <p className="text-xl font-semibold">🔥</p>
              </div>
            </div>
          </div>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {streak === 0
              ? "Start your learning journey today! Even 15 minutes makes a difference."
              : "Don't break your streak! A quick study session will help you stay on track."}
          </p>

          {/* Quick Actions */}
          <div className="space-y-3">
            <button
              onClick={handleComplete}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center space-x-2"
            >
              <CheckCircleIcon className="h-5 w-5" />
              <span>I'll Study Now</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSnooze(15)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl text-sm"
              >
                Snooze 15m
              </button>
              <button
                onClick={() => handleSnooze(30)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl text-sm"
              >
                Snooze 30m
              </button>
            </div>

            <button
              onClick={() => {
                setReminderEnabled(false);
                setShowReminder(false);
              }}
              className="w-full px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Disable Reminders
            </button>
          </div>

          {/* Reminder Time Setting */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Daily Reminder Time</span>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyReminder;
