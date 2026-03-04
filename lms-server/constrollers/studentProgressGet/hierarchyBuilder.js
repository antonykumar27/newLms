// helpers/hierarchyBuilder.js

const { formatDuration, timeAgo } = require("./formatters");

/**
 * Build content hierarchy with progress
 */
exports.buildContentHierarchy = ({
  subjects,
  chapters,
  pages,
  videos,
  watchTime,
  quizAttempts,
  user,
}) => {
  return subjects.map((subject) => {
    const subjectChapters = chapters.filter(
      (ch) => ch.subjectId.toString() === subject._id.toString(),
    );
    const subjectWatchTime = watchTime.filter(
      (w) => w.subject?._id?.toString() === subject._id.toString(),
    );
    const subjectQuizzes = quizAttempts.filter(
      (q) => q.contextIds?.subjectId?.toString() === subject._id.toString(),
    );

    return {
      subjectId: subject._id,
      subjectName: subject.subject || subject.name,
      description: subject.description,
      icon: subject.icon,
      order: subject.order,

      progress: {
        totalWatchTime: subjectWatchTime.reduce(
          (sum, w) => sum + (w.totalWatchedSeconds || 0),
          0,
        ),
        formattedWatchTime: formatDuration(
          subjectWatchTime.reduce(
            (sum, w) => sum + (w.totalWatchedSeconds || 0),
            0,
          ),
        ),
        averageProgress: subjectWatchTime.length
          ? Math.round(
              subjectWatchTime.reduce((sum, w) => sum + (w.progress || 0), 0) /
                subjectWatchTime.length,
            )
          : 0,
        completedVideos: subjectWatchTime.filter((w) => w.completed).length,
        totalVideos: subjectWatchTime.length,
        quizAttempts: subjectQuizzes.length,
        averageQuizScore: subjectQuizzes.length
          ? Math.round(
              subjectQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) /
                subjectQuizzes.length,
            )
          : 0,
        chaptersCompleted: subjectChapters.filter((ch) =>
          user?.completedChapters?.includes(ch._id),
        ).length,
        totalChapters: subjectChapters.length,
        progressPercentage: subjectChapters.length
          ? Math.round(
              (subjectChapters.filter((ch) =>
                user?.completedChapters?.includes(ch._id),
              ).length /
                subjectChapters.length) *
                100,
            )
          : 0,
      },

      chapters: subjectChapters.map((chapter) =>
        this.buildChapterHierarchy(chapter, {
          pages,
          videos,
          watchTime,
          quizAttempts,
          user,
        }),
      ),
    };
  });
};

/**
 * Build chapter hierarchy
 */
exports.buildChapterHierarchy = (
  chapter,
  { pages, videos, watchTime, quizAttempts, user },
) => {
  const chapterPages = pages.filter(
    (p) => p.chapterId.toString() === chapter._id.toString(),
  );
  const chapterVideos = videos.filter(
    (v) => v.chapterId?.toString() === chapter._id.toString(),
  );
  const chapterWatchTime = watchTime.filter(
    (w) => w.chapter?._id?.toString() === chapter._id.toString(),
  );
  const chapterQuizzes = quizAttempts.filter(
    (q) => q.contextIds?.chapterId?.toString() === chapter._id.toString(),
  );

  return {
    chapterId: chapter._id,
    chapterNumber: chapter.chapterNumber,
    title: chapter.title,
    description: chapter.description,

    progress: {
      totalWatchTime: chapterWatchTime.reduce(
        (sum, w) => sum + (w.totalWatchedSeconds || 0),
        0,
      ),
      formattedWatchTime: formatDuration(
        chapterWatchTime.reduce(
          (sum, w) => sum + (w.totalWatchedSeconds || 0),
          0,
        ),
      ),
      averageProgress: chapterWatchTime.length
        ? Math.round(
            chapterWatchTime.reduce((sum, w) => sum + (w.progress || 0), 0) /
              chapterWatchTime.length,
          )
        : 0,
      completedVideos: chapterWatchTime.filter((w) => w.completed).length,
      totalVideos: chapterWatchTime.length,
      quizAttempts: chapterQuizzes.length,
      averageQuizScore: chapterQuizzes.length
        ? Math.round(
            chapterQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) /
              chapterQuizzes.length,
          )
        : 0,
      pagesCompleted: chapterPages.filter((p) =>
        user?.completedPages?.includes(p._id),
      ).length,
      totalPages: chapterPages.length,
      progressPercentage: chapterPages.length
        ? Math.round(
            (chapterPages.filter((p) => user?.completedPages?.includes(p._id))
              .length /
              chapterPages.length) *
              100,
          )
        : 0,
    },

    pages: chapterPages.map((page) =>
      this.buildPageHierarchy(page, { videos, watchTime, quizAttempts, user }),
    ),
  };
};

/**
 * Build page hierarchy
 */
exports.buildPageHierarchy = (
  page,
  { videos, watchTime, quizAttempts, user },
) => {
  const pageVideos = videos.filter(
    (v) => v.pageId?.toString() === page._id.toString(),
  );
  const pageWatchTime = watchTime.filter(
    (w) => w.page?._id?.toString() === page._id.toString(),
  );
  const pageQuizzes = quizAttempts.filter(
    (q) => q.contextIds?.pageId?.toString() === page._id.toString(),
  );

  return {
    pageId: page._id,
    title: page.title,
    description: page.description,
    contentType: page.contentType,
    order: page.order,

    progress: {
      totalWatchTime: pageWatchTime.reduce(
        (sum, w) => sum + (w.totalWatchedSeconds || 0),
        0,
      ),
      formattedWatchTime: formatDuration(
        pageWatchTime.reduce((sum, w) => sum + (w.totalWatchedSeconds || 0), 0),
      ),
      averageProgress: pageWatchTime.length
        ? Math.round(
            pageWatchTime.reduce((sum, w) => sum + (w.progress || 0), 0) /
              pageWatchTime.length,
          )
        : 0,
      completedVideos: pageWatchTime.filter((w) => w.completed).length,
      totalVideos: pageWatchTime.length,
      quizAttempts: pageQuizzes.length,
      lastQuizScore: pageQuizzes[0]?.score || null,
      bestQuizScore: Math.max(...pageQuizzes.map((q) => q.score || 0), 0),
      isCompleted: user?.completedPages?.includes(page._id) || false,
      lastAccessed: pageWatchTime[0]?.lastWatchedAt || null,
    },

    videos: pageVideos.map((video) =>
      this.buildVideoHierarchy(video, watchTime),
    ),
  };
};

/**
 * Build video hierarchy
 */
exports.buildVideoHierarchy = (video, watchTime) => {
  const videoWatchTime = watchTime.find(
    (w) => w.videoId?._id?.toString() === video._id.toString(),
  );

  return {
    videoId: video._id,
    title: video.title,
    description: video.description,
    duration: video.duration,
    thumbnailUrl: video.thumbnailUrl,
    order: video.order,

    progress: videoWatchTime
      ? {
          watchedSeconds: videoWatchTime.totalWatchedSeconds || 0,
          formattedWatchTime: formatDuration(
            videoWatchTime.totalWatchedSeconds,
          ),
          progress: videoWatchTime.progress || 0,
          completed: videoWatchTime.completed || false,
          lastWatchedAt: videoWatchTime.lastWatchedAt,
          lastWatchedFromNow: timeAgo(videoWatchTime.lastWatchedAt),
          watchTimePercentage: video.duration
            ? Math.min(
                100,
                Math.round(
                  (videoWatchTime.totalWatchedSeconds / video.duration) * 100,
                ),
              )
            : 0,
        }
      : {
          watchedSeconds: 0,
          formattedWatchTime: "0 min",
          progress: 0,
          completed: false,
          lastWatchedAt: null,
          watchTimePercentage: 0,
        },
  };
};
