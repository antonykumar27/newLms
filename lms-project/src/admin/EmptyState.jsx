import React from "react";
import {
  Search,
  Inbox,
  BookOpen,
  AlertTriangle,
  Plus,
  Filter,
  AlertCircle,
  FileText,
  Award,
  RefreshCw,
  Mail,
  HelpCircle,
  X,
} from "lucide-react";

const EmptyState = ({
  title = "Nothing here yet",
  message = "Get started by adding some content",
  icon = "search",
  actionText,
  secondaryActionText,
  onAction,
  onSecondaryAction,
  children,
}) => {
  const getIcon = () => {
    const iconProps = {
      className: "h-12 w-12 mx-auto",
      strokeWidth: 1.5,
    };

    switch (icon) {
      case "search":
        return <Search {...iconProps} />;
      case "inbox":
        return <Inbox {...iconProps} />;
      case "book":
        return <BookOpen {...iconProps} />;
      case "warning":
        return <AlertTriangle {...iconProps} />;
      case "add":
        return <Plus {...iconProps} />;
      case "filter":
        return <Filter {...iconProps} />;
      case "alert":
        return <AlertCircle {...iconProps} />;
      case "document":
        return <FileText {...iconProps} />;
      case "award":
        return <Award {...iconProps} />;
      case "refresh":
        return <RefreshCw {...iconProps} />;
      default:
        return <Search {...iconProps} />;
    }
  };

  const getColor = () => {
    switch (icon) {
      case "warning":
        return "text-yellow-500";
      case "alert":
        return "text-red-500";
      case "add":
        return "text-blue-500";
      case "filter":
        return "text-purple-500";
      case "award":
        return "text-amber-500";
      case "document":
        return "text-emerald-500";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="text-center py-12 px-4">
      <div className={`mb-6 ${getColor()}`}>{getIcon()}</div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>

      <p className="text-gray-600 max-w-md mx-auto mb-8">{message}</p>

      {children && <div className="mb-8">{children}</div>}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {actionText}
          </button>
        )}

        {secondaryActionText && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {secondaryActionText}
          </button>
        )}
      </div>

      {/* Decorative elements */}
      <div className="mt-12 opacity-10">
        <svg
          className="w-64 h-64 mx-auto"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
};

// Pre-configured variants for common use cases
export const EmptySearchResults = ({ searchQuery, onClearSearch }) => (
  <EmptyState
    title="No results found"
    message={`We couldn't find anything matching "${searchQuery}"`}
    icon="search"
    actionText="Clear search"
    onAction={onClearSearch}
  >
    <div className="text-sm text-gray-500">
      Try different keywords or check spelling
    </div>
  </EmptyState>
);

export const EmptyChapters = ({ onAddChapter }) => (
  <EmptyState
    title="No chapters available"
    message="Start by creating your first chapter"
    icon="book"
    actionText="Create Chapter"
    onAction={onAddChapter}
  >
    <div className="text-sm text-gray-500">
      Chapters help organize your learning content
    </div>
  </EmptyState>
);

export const EmptyQuestions = ({ onAddQuestion }) => (
  <EmptyState
    title="No questions yet"
    message="Add questions to create practice tests"
    icon="add"
    actionText="Add Question"
    onAction={onAddQuestion}
  >
    <div className="text-sm text-gray-500">
      Questions can be multiple choice, true/false, or open-ended
    </div>
  </EmptyState>
);

export const EmptyProgress = () => (
  <EmptyState
    title="No progress yet"
    message="Start practicing questions to track your progress"
    icon="inbox"
    actionText="Start Practicing"
    onAction={() => (window.location.href = "/practice")}
  >
    <div className="text-sm text-gray-500">
      Your progress will appear here as you learn
    </div>
  </EmptyState>
);

export const EmptyResults = () => (
  <EmptyState
    title="No results yet"
    message="Complete some quizzes to see your results"
    icon="award"
    actionText="Take a Quiz"
    onAction={() => (window.location.href = "/quizzes")}
  >
    <div className="text-sm text-gray-500">
      Your scores and performance will be displayed here
    </div>
  </EmptyState>
);

export const EmptyFilters = ({ onClearFilters }) => (
  <EmptyState
    title="No matching items"
    message="No items match your current filters"
    icon="filter"
    actionText="Clear Filters"
    onAction={onClearFilters}
  >
    <div className="text-sm text-gray-500">
      Try adjusting your filters to see more results
    </div>
  </EmptyState>
);

export const ErrorState = ({ error, onRetry }) => (
  <EmptyState
    title="Something went wrong"
    message={error || "We encountered an unexpected error"}
    icon="alert"
    actionText="Try Again"
    onAction={onRetry}
    secondaryActionText="Report Issue"
    onSecondaryAction={() =>
      window.open("mailto:support@example.com", "_blank")
    }
  >
    <div className="text-sm text-gray-500">
      If the problem persists, please contact support
    </div>
  </EmptyState>
);

export const LoadingErrorState = ({ onRetry }) => (
  <EmptyState
    title="Failed to load data"
    message="Unable to load the requested content"
    icon="refresh"
    actionText="Retry"
    onAction={onRetry}
  >
    <div className="text-sm text-gray-500">
      Check your connection and try again
    </div>
  </EmptyState>
);

export const EmptyUsers = ({ onAddUser }) => (
  <EmptyState
    title="No users found"
    message="Start by adding users to your system"
    icon="add"
    actionText="Add User"
    onAction={onAddUser}
  >
    <div className="text-sm text-gray-500">
      Users can be students, teachers, or administrators
    </div>
  </EmptyState>
);

export const EmptyMessages = () => (
  <EmptyState
    title="No messages"
    message="Your inbox is empty"
    icon="inbox"
    actionText="Compose Message"
    onAction={() => (window.location.href = "/messages/compose")}
  >
    <div className="text-sm text-gray-500">
      Start a conversation with your team
    </div>
  </EmptyState>
);

export default EmptyState;
