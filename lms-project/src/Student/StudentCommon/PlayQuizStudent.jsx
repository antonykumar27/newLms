import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";

// Import your actual quiz API
import {
  useStoreResultMutation,
  useGetQuestionsByPageIdQuery,
  useGetChapterByIdQuery,
  useGetSubjectsByIdQuery,
} from "../../store/api/QuizApi";
import { useAuth } from "../../common/AuthContext";

// Import utility functions
import { processQuizData, formatTime, getDifficultyColor } from "./quizUtils";

// Import sub-components
import QuizLoadingState from "./QuizLoadingState";
import QuizErrorState from "./QuizErrorState";
import NoQuestionsState from "./NoQuestionsState";
import ContentPreview from "./ContentPreview";
import QuizStartScreen from "./QuizStartScreen";
import QuizResultsScreen from "./QuizResultsScreen";
import ActiveQuizInterface from "./ActiveQuizInterface";

const PlayQuizStudent = ({ quizId, onComplete, onCancel }) => {
  const { id } = useParams();
  console.log("issssssssss", id);
  const { state } = useLocation();
  const { user } = useAuth();

  const chapterId = state?.chapterId;
  const subjectId = state?.subjectId?.id;

  const subjectQuery = useGetSubjectsByIdQuery(subjectId, {
    skip: !subjectId,
  });

  const chapterQuery = useGetChapterByIdQuery(chapterId, {
    skip: !!subjectId || !chapterId,
  });

  const pageQuery = useGetQuestionsByPageIdQuery(id, {
    skip: !!subjectId || !!chapterId,
  });

  let activeQuery;
  let quizType;
  let quizCategory;
  if (subjectId) {
    activeQuery = subjectQuery;
    quizType = subjectId;
    quizCategory = "SUBJECT";
  } else if (chapterId) {
    activeQuery = chapterQuery;
    quizType = chapterId;
    quizCategory = "CHAPTER";
  } else {
    activeQuery = pageQuery;
    quizType = id;
    quizCategory = "PAGE";
  }

  const {
    data: quizData,
    isLoading: quizLoading,
    isError: quizError,
    refetch,
  } = activeQuery;
  const chapterNumber = quizData?.chapterNumber;
  const chapterTitle = quizData?.chapterTitle;
  const standard = quizData?.standard;
  const subjectName = quizData?.subjectName;
  console.log("quizData", quizData);
  console.log("quizError", quizError);

  const [storeResult] = useStoreResultMutation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [textAnswers, setTextAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [showContent, setShowContent] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  // Process quiz data with new structure
  const { questions, quizInfo } = useMemo(() => {
    return processQuizData(quizData, quizId || id);
  }, [quizData, quizId, id]);

  // Create pages from questions for content view
  const pages = useMemo(() => {
    return questions.map((q, index) => ({
      _id: q.id || index,
      title: q.question
        ? q.question.replace(/^#\s*/, "").split("\n")[0]
        : `Question ${index + 1}`,
      pageNumber: index + 1,
      updatedAt: q.createdAt,
      content: q.question || "",
      explanation: q.explanation || "",
      questionMedia: q.questionMedia,
      media: q.media || [],
      options: q.options || [],
      optionMedia: q.optionMedia || [],
      correctAnswer: q.correctAnswer,
      marks: q.marks || 1,
      questionType: q.questionType,
      originalQuestion: q,
    }));
  }, [questions]);

  // Initialize timer when quiz starts
  useEffect(() => {
    if (!quizStarted || quizCompleted) return;

    const totalTime = quizInfo.duration || 1800;
    setTimeLeft(totalTime);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, quizCompleted, quizInfo]);

  const handleOptionSelect = (optionIndex) => {
    const question = questions[currentQuestion];

    if (!question) return;

    if (question.questionType === "single") {
      setSelectedOptions({
        ...selectedOptions,
        [currentQuestion]: [optionIndex],
      });
    } else if (question.questionType === "multiple") {
      const currentSelections = selectedOptions[currentQuestion] || [];
      const newSelections = currentSelections.includes(optionIndex)
        ? currentSelections.filter((idx) => idx !== optionIndex)
        : [...currentSelections, optionIndex];

      setSelectedOptions({
        ...selectedOptions,
        [currentQuestion]: newSelections,
      });
    }

    setShowExplanation(false);
  };

  const handleTextAnswerChange = (questionIndex, answer) => {
    setTextAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));

    setSelectedOptions({
      ...selectedOptions,
      [questionIndex]: [answer],
    });

    setShowExplanation(false);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowExplanation(false);
    }
  };

  const handleAutoSubmit = async () => {
    await calculateAndSubmitResults();
  };

  const calculateAndSubmitResults = async () => {
    if (quizCompleted || questions.length === 0) return;

    let correctAnswers = 0;
    let totalMarksObtained = 0;
    let detailedResults = [];

    questions.forEach((question, index) => {
      const selectedIndices = selectedOptions[index] || [];
      const textAnswer = textAnswers[index] || "";
      let isCorrect = false;
      let userAnswerDisplay = "";

      if (question.questionType === "text") {
        userAnswerDisplay = textAnswer;

        const correctAnswersList = question.correctAnswer
          ? question.correctAnswer
              .split(",")
              .map((ans) => ans.trim().toLowerCase())
          : [];

        isCorrect = correctAnswersList.includes(
          textAnswer.trim().toLowerCase(),
        );
      } else if (question.questionType === "single") {
        userAnswerDisplay =
          selectedIndices.length > 0
            ? question.options[selectedIndices[0]]
            : "Not answered";
        isCorrect =
          selectedIndices.length === 1 &&
          selectedIndices[0] === question.correctAnswer;
      } else {
        userAnswerDisplay = selectedIndices
          .map((idx) => question.options[idx])
          .join(", ");

        const selectedSet = new Set(selectedIndices);
        const correctSet = new Set(question.correctAnswer || []);
        isCorrect =
          selectedIndices.length === (question.correctAnswer?.length || 0) &&
          selectedIndices.every((idx) => correctSet.has(idx)) &&
          question.correctAnswer.every((idx) => selectedSet.has(idx));
      }

      if (isCorrect) {
        correctAnswers++;
        totalMarksObtained += question.marks || 1;
      }

      detailedResults.push({
        question: question.question,
        userAnswer: userAnswerDisplay,
        correctAnswer:
          question.questionType === "text"
            ? question.correctAnswer
            : question.questionType === "single"
              ? [question.options[question.correctAnswer]]
              : (question.correctAnswer || []).map(
                  (idx) => question.options[idx],
                ),
        isCorrect,
        explanation: question.explanation,
        marks: question.marks || 1,
        marksObtained: isCorrect ? question.marks || 1 : 0,
        questionMedia: question.questionMedia,
        optionMedia: question.optionMedia,
        questionType: question.questionType,
      });
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const timeTaken = (quizInfo.duration || 1800) - timeLeft;

    const results = {
      quizId: quizInfo._id,
      quizTitle: quizInfo.quizTitle,
      score,
      correctAnswers,
      totalQuestions: questions.length,
      totalMarks: quizInfo.totalMarks,
      marksObtained: totalMarksObtained,
      timeTaken,
      standard: quizInfo.standard,
      subject: quizInfo.subject,
      chapter: quizInfo.chapter,
      chapterNumber: quizInfo.chapterNumber,
      topic: quizInfo.topic,
      difficulty: quizInfo.difficulty,
      language: quizInfo.language,
      detailedResults,
    };

    setQuizResults(results);
    setQuizCompleted(true);

    try {
      if (user) {
        await storeResult({
          quizId: quizInfo._id,
          quizType,
          quizCategory,
          quizTitle: quizInfo.quizTitle,
          score,
          correctAnswers,
          totalQuestions: questions.length,
          totalMarks: quizInfo.totalMarks,
          marksObtained: totalMarksObtained,
          timeTaken,
          standard: quizInfo.standard,
          date: new Date().toISOString(),
        }).unwrap();
      }
    } catch (err) {
      console.error("Failed to store result:", err);
    }

    if (onComplete) onComplete(results);
  };

  const getQuestionStatus = (index) => {
    const question = questions[index];
    if (!question) return "unanswered";

    if (question.questionType === "text") {
      return textAnswers[index] ? "answered" : "unanswered";
    } else {
      const selected = selectedOptions[index];
      return selected && selected.length > 0 ? "answered" : "unanswered";
    }
  };

  // Loading state
  if (quizLoading) {
    return <QuizLoadingState />;
  }

  // Error state
  if (quizError || !quizData) {
    return (
      <QuizErrorState
        quizError={quizError}
        onRetry={refetch}
        onCancel={onCancel}
      />
    );
  }

  // No questions state
  if (!questions || questions.length === 0) {
    return <NoQuestionsState onCancel={onCancel} />;
  }

  // Content View (Before Quiz Starts)
  if (!quizStarted && showContent) {
    return (
      <ContentPreview
        pages={pages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        quizInfo={quizInfo}
        questions={questions}
        onStartQuiz={() => setShowContent(false)}
        onCancel={onCancel}
        chapterNumber={chapterNumber}
        chapterTitle={chapterTitle}
        standard={standard}
        subjectName={subjectName}
      />
    );
  }

  // Quiz Interface - Start Screen
  if (!quizStarted) {
    return (
      <QuizStartScreen
        quizInfo={quizInfo}
        questions={questions}
        user={user}
        onStartQuiz={() => setQuizStarted(true)}
        onShowContent={() => setShowContent(true)}
        getDifficultyColor={getDifficultyColor}
      />
    );
  }

  // Quiz Results
  if (quizCompleted && quizResults) {
    return (
      <QuizResultsScreen
        quizResults={quizResults}
        quizInfo={quizInfo}
        onComplete={onComplete}
        onReset={() => {
          setQuizStarted(false);
          setQuizCompleted(false);
          setCurrentQuestion(0);
          setSelectedOptions({});
          setTextAnswers({});
          setQuizResults(null);
          setShowContent(true);
        }}
        formatTime={formatTime}
      />
    );
  }

  // Active Quiz Interface
  return (
    <ActiveQuizInterface
      questions={questions}
      currentQuestion={currentQuestion}
      selectedOptions={selectedOptions}
      textAnswers={textAnswers}
      timeLeft={timeLeft}
      showExplanation={showExplanation}
      quizInfo={quizInfo}
      onOptionSelect={handleOptionSelect}
      onTextAnswerChange={handleTextAnswerChange}
      onNext={handleNext}
      onPrev={handlePrev}
      onSubmit={calculateAndSubmitResults}
      onQuestionSelect={setCurrentQuestion}
      onToggleExplanation={() => setShowExplanation(!setShowExplanation)}
      getQuestionStatus={getQuestionStatus}
      getDifficultyColor={getDifficultyColor}
      formatTime={formatTime}
    />
  );
};

export default PlayQuizStudent;
