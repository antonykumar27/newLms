export const processQuizData = (quizData, quizId, id) => {
  if (!quizData || !quizData.success) return { questions: [], quizInfo: {} };

  const data = quizData?.data || [];

  if (Array.isArray(data)) {
    const processedQuestions = data.map((item, index) => {
      if (item.questionType === "TEXT") {
        return {
          id: item._id || `question-${index}`,
          question: item.question || "",
          explanation: item.explanation || "",
          options: [],
          optionMedia: [],
          correctAnswer: item.correctAnswer || "",
          marks: item.marks || 1,
          questionType: "text",
          questionMedia: item.questionImageUrl,
          media: item.media || [],
          hints: item.hints || [],
          difficulty: item.difficulty || "Medium",
          createdAt: item.createdAt,
          standard: item.standard || "9th",
          subject: item.subject || "Science",
          chapter: item.chapter || "Generalwwwwwwwwwwwwwwwwwww",
          topic: item.topic || "General Quiz",
          language: item.language || "Malayalam",
        };
      }

      const processedOptions = (item.options || []).map((option) => {
        return {
          text: option.value || "",
          media: option.optionImageUrl,
        };
      });

      let correctAnswer;
      const correctAnswerText = item.correctAnswer?.replace(/^#\s*/, "") || "";

      if (item.questionType === "MCQ_SINGLE") {
        const correctAnswerIndex = processedOptions.findIndex(
          (opt) => opt.text.replace(/^#\s*/, "") === correctAnswerText,
        );
        correctAnswer = correctAnswerIndex >= 0 ? correctAnswerIndex : 0;
      } else if (item.questionType === "MCQ_MULTIPLE") {
        try {
          const indices = JSON.parse(correctAnswerText);
          correctAnswer = Array.isArray(indices) ? indices : [];
        } catch {
          correctAnswer = [];
        }
      } else {
        const correctAnswerIndex = processedOptions.findIndex(
          (opt) => opt.text.replace(/^#\s*/, "") === correctAnswerText,
        );
        correctAnswer = correctAnswerIndex >= 0 ? correctAnswerIndex : 0;
      }

      return {
        id: item._id || `question-${index}`,
        question: item.question || "",
        explanation: item.explanation || "",
        options: processedOptions.map((opt) => opt.text),
        optionMedia: processedOptions.map((opt) => opt.media),
        correctAnswer: correctAnswer,
        marks: item.marks || 1,
        questionType:
          item.questionType === "MCQ_MULTIPLE" ? "multiple" : "single",
        questionMedia: item.questionImageUrl,
        media: item.media || [],
        hints: item.hints || [],
        difficulty: item.difficulty || "Medium",
        createdAt: item.createdAt,
        standard: item.standard || "9th",
        subject: item.subject || "Science",
        chapter: item.chapter || "Generalssssssssssssss",
        topic: item.topic || "General Quiz",
        language: item.language || "Malayalam",
      };
    });

    const totalMarks = processedQuestions.reduce(
      (sum, q) => sum + (q.marks || 1),
      0,
    );

    return {
      questions: processedQuestions,
      quizInfo: {
        _id: quizId || id,
        quizTitle: data[0]?.topic || `Quiz for Chapter ${id}`,
        description: "Quiz based on the chapter content",
        duration: 1800,
        totalMarks: totalMarks,
        passingScore: 70,
        difficulty: data[0]?.difficulty || "Medium",
        standard: data[0]?.standard || "10th",
        subject: data[0]?.subject || "Science",
        chapter: data[0]?.chapter || `Chapter ${id}`,
        chapterNumber: data[0]?.chapterNumber || id,
        topic: data[0]?.topic || "Quiz",
        language: data[0]?.language || "Malayalam",
      },
    };
  }

  return {
    questions: [],
    quizInfo: {},
  };
};

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export const getDifficultyColor = (difficulty) => {
  if (!difficulty) return "text-gray-600 bg-gray-100";

  switch (difficulty.toLowerCase()) {
    case "easy":
      return "text-green-600 bg-green-100";
    case "medium":
      return "text-yellow-600 bg-yellow-100";
    case "hard":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

export const getQuestionTypeIcon = (type) => {
  switch (type) {
    case "text":
      return "text";
    case "multiple":
      return "multiple";
    case "single":
    default:
      return "single";
  }
};
