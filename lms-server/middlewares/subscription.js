const Enrollment = require("../models/enrollment");
const StandardChapter = require("../models/standardChapterScheema");

exports.checkChapterAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { chapterId } = req.params;

    const chapter = await StandardChapter.findById(chapterId).populate(
      "subjectId",
      "subject standard part",
    );

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      });
    }

    const standardId = chapter.subjectId.standard;

    const enrollment = await Enrollment.findOne({
      student: userId,
      standard: standardId,
      paymentStatus: "paid",
      isActive: true,
    }).populate("order");

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "Subscription ഇല്ല",
      });
    }

    const now = new Date();
    const endDate = enrollment.order.subscription.endDate;

    if (now > endDate) {
      enrollment.isActive = false;
      enrollment.status = "expired";
      await enrollment.save();

      return res.status(403).json({
        success: false,
        message: "Subscription കാലാവധി കഴിഞ്ഞു",
      });
    }

    req.chapter = chapter;
    req.enrollment = enrollment;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Access validation failed",
    });
  }
};
