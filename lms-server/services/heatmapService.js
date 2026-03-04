const StudentHeatmap = require("../models/StudentHeatmap");
const DailyActivity = require("../models/dailyActivity");

class HeatmapService {
  // 🎯 ഹീറ്റ്മാപ്പ് അപ്ഡേറ്റ് ചെയ്യുക
  async updateHeatmap(studentId, dailyActivity, eventData) {
    try {
      const year = new Date(dailyActivity.date).getFullYear();
      const month = new Date(dailyActivity.date).getMonth();

      // ഹീറ്റ്മാപ്പ് കണ്ടെത്തുക അല്ലെങ്കിൽ പുതിയത് ഉണ്ടാക്കുക
      let heatmap = await StudentHeatmap.findOne({
        studentId,
        year,
      });

      if (!heatmap) {
        heatmap = new StudentHeatmap({
          studentId,
          year,
          cells: [],
          monthlyBreakdown: [],
          summary: {
            totalActiveDays: 0,
            totalWatchTime: 0,
            totalVideosCompleted: 0,
            longestStreak: 0,
            currentStreak: 0,
            consistencyScore: 0,
          },
        });
      }

      // ഇന്നത്തെ സെൽ കണ്ടെത്തുക അല്ലെങ്കിൽ പുതിയത് ഉണ്ടാക്കുക
      let todayCell = heatmap.cells.find(
        (cell) =>
          cell.date.toDateString() === dailyActivity.date.toDateString(),
      );

      if (!todayCell) {
        todayCell = {
          date: dailyActivity.date,
          intensity: 0,
          watchTime: 0,
          videosCompleted: 0,
          videosStarted: 0,
          color: "#ebedf0",
          hourlyActivity: [],
          subjects: [],
        };
        heatmap.cells.push(todayCell);
      }

      // 🕒 ഡെയ്ലി ആക്റ്റിവിറ്റിയിൽ നിന്നും ഡാറ്റ അപ്ഡേറ്റ് ചെയ്യുക
      todayCell.watchTime = dailyActivity.totalWatchTime;
      todayCell.videosStarted = dailyActivity.videosStarted;
      todayCell.videosCompleted = dailyActivity.videosCompleted;

      // 🔥 Intensity കണക്കാക്കുക
      todayCell.intensity = heatmap.calculateIntensity(
        todayCell.watchTime,
        todayCell.videosCompleted,
      );

      // 🎨 നിറം നിർണയിക്കുക
      todayCell.color = heatmap.getColorForIntensity(todayCell.intensity);

      // ⏰ മണിക്കൂർ തിരിച്ചുള്ള വിവരങ്ങൾ അപ്ഡേറ്റ് ചെയ്യുക
      if (
        dailyActivity.hourlyBreakdown &&
        dailyActivity.hourlyBreakdown.length > 0
      ) {
        todayCell.hourlyActivity = dailyActivity.hourlyBreakdown.map(
          (hour) => ({
            hour: hour.hour,
            watchTime: hour.watchTime,
            intensity:
              hour.watchTime > 0
                ? heatmap.calculateIntensity(hour.watchTime, hour.videosWatched)
                : 0,
          }),
        );
      }

      // 📚 വിഷയ തിരിച്ചുള്ള വിവരങ്ങൾ അപ്ഡേറ്റ് ചെയ്യുക
      if (
        dailyActivity.subjectBreakdown &&
        dailyActivity.subjectBreakdown.length > 0
      ) {
        todayCell.subjects = dailyActivity.subjectBreakdown.map((subject) => ({
          subjectId: subject.subjectId,
          watchTime: subject.watchTime,
          videosWatched: subject.videosWatched,
        }));
      }

      // 📈 മാസ ബ്രേക്ക്ഡൗൺ അപ്ഡേറ്റ് ചെയ്യുക
      await this.updateMonthlyBreakdown(heatmap, dailyActivity.date, todayCell);

      // 📊 സംഗ്രഹം അപ്ഡേറ്റ് ചെയ്യുക
      await this.updateSummary(heatmap);

      // 🏆 സ്ട്രീക്ക് കണക്കാക്കുക
      heatmap.summary.currentStreak = heatmap.calculateCurrentStreak();
      heatmap.summary.longestStreak = Math.max(
        heatmap.summary.longestStreak,
        heatmap.summary.currentStreak,
      );

      // 📝 Consistency Score
      heatmap.summary.consistencyScore = heatmap.calculateConsistencyScore();

      heatmap.lastUpdated = new Date();
      await heatmap.save();

      return heatmap;
    } catch (error) {
      console.error("Heatmap service error:", error);
      throw error;
    }
  }

  // 📆 മാസ ബ്രേക്ക്ഡൗൺ അപ്ഡേറ്റ് ചെയ്യുക
  async updateMonthlyBreakdown(heatmap, date, cell) {
    const month = new Date(date).getMonth();
    const year = new Date(date).getFullYear();

    let monthlyBreakdown = heatmap.monthlyBreakdown.find(
      (m) => m.month === month && m.year === year,
    );

    if (!monthlyBreakdown) {
      monthlyBreakdown = {
        month,
        year,
        totalWatchTime: 0,
        activeDays: 0,
        averageDailyTime: 0,
        peakHour: null,
      };
      heatmap.monthlyBreakdown.push(monthlyBreakdown);
    }

    // മാസത്തെ ആകെ സമയം അപ്ഡേറ്റ് ചെയ്യുക
    monthlyBreakdown.totalWatchTime += cell.watchTime;

    // ആക്റ്റീവ് ദിവസങ്ങൾ കണക്കാക്കുക
    const daysInMonth = heatmap.cells.filter(
      (c) =>
        new Date(c.date).getMonth() === month &&
        new Date(c.date).getFullYear() === year &&
        c.intensity > 0,
    ).length;

    monthlyBreakdown.activeDays = daysInMonth;

    // ശരാശരി സമയം
    monthlyBreakdown.averageDailyTime =
      daysInMonth > 0 ? monthlyBreakdown.totalWatchTime / daysInMonth : 0;

    // പീക്ക് അവർ (ഏറ്റവും കൂടുതൽ പഠിച്ച സമയം)
    const hourlyTotals = heatmap.cells
      .filter((c) => new Date(c.date).getMonth() === month)
      .flatMap((c) => c.hourlyActivity)
      .reduce((acc, curr) => {
        acc[curr.hour] = (acc[curr.hour] || 0) + curr.watchTime;
        return acc;
      }, {});

    const peakHour = Object.entries(hourlyTotals).sort(
      ([, a], [, b]) => b - a,
    )[0];

    monthlyBreakdown.peakHour = peakHour ? parseInt(peakHour[0]) : null;
  }

  // 📊 സംഗ്രഹം അപ്ഡേറ്റ് ചെയ്യുക
  async updateSummary(heatmap) {
    const activeCells = heatmap.cells.filter((cell) => cell.intensity > 0);

    heatmap.summary.totalActiveDays = activeCells.length;
    heatmap.summary.totalWatchTime = heatmap.cells.reduce(
      (sum, cell) => sum + cell.watchTime,
      0,
    );
    heatmap.summary.totalVideosCompleted = heatmap.cells.reduce(
      (sum, cell) => sum + cell.videosCompleted,
      0,
    );
    heatmap.summary.totalVideosStarted = heatmap.cells.reduce(
      (sum, cell) => sum + cell.videosStarted,
      0,
    );

    // ഏറ്റവും ആക്റ്റീവ് മാസം
    const monthCounts = heatmap.cells.reduce((acc, cell) => {
      if (cell.intensity > 0) {
        const month = new Date(cell.date).getMonth();
        acc[month] = (acc[month] || 0) + 1;
      }
      return acc;
    }, {});

    const mostActiveMonth = Object.entries(monthCounts).sort(
      ([, a], [, b]) => b - a,
    )[0];

    heatmap.summary.mostActiveMonth = mostActiveMonth
      ? parseInt(mostActiveMonth[0])
      : null;

    // ഏറ്റവും ആക്റ്റീവ് സമയം
    const hourCounts = heatmap.cells
      .flatMap((cell) => cell.hourlyActivity)
      .reduce((acc, curr) => {
        if (curr && curr.intensity > 0) {
          acc[curr.hour] = (acc[curr.hour] || 0) + 1;
        }
        return acc;
      }, {});

    const mostActiveHour = Object.entries(hourCounts).sort(
      ([, a], [, b]) => b - a,
    )[0];

    heatmap.summary.mostActiveHour = mostActiveHour
      ? parseInt(mostActiveHour[0])
      : null;

    // പ്രിയപ്പെട്ട വിഷയം
    const subjectCounts = {};
    heatmap.cells.forEach((cell) => {
      cell.subjects.forEach((subject) => {
        const id = subject.subjectId.toString();
        subjectCounts[id] = (subjectCounts[id] || 0) + subject.watchTime;
      });
    });

    const favoriteSubject = Object.entries(subjectCounts).sort(
      ([, a], [, b]) => b - a,
    )[0];

    heatmap.summary.favoriteSubject = favoriteSubject
      ? favoriteSubject[0]
      : null;
  }

  // 🔄 ഹീറ്റ്മാപ്പ് പുനഃക്രമീകരിക്കുക (റീകാൽക്കുലേറ്റ്)
  async recalculateHeatmap(studentId, year) {
    try {
      // ആ വർഷത്തെ എല്ലാ ഡെയ്ലി ആക്റ്റിവിറ്റിയും എടുക്കുക
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);

      const dailyActivities = await DailyActivity.find({
        studentId,
        date: { $gte: startDate, $lte: endDate },
      }).sort({ date: 1 });

      // പുതിയ ഹീറ്റ്മാപ്പ് ഉണ്ടാക്കുക
      let heatmap = await StudentHeatmap.findOne({ studentId, year });

      if (!heatmap) {
        heatmap = new StudentHeatmap({ studentId, year, cells: [] });
      } else {
        heatmap.cells = [];
        heatmap.monthlyBreakdown = [];
      }

      // ഓരോ ദിവസത്തെയും ഡാറ്റ പ്രോസസ്സ് ചെയ്യുക
      for (const daily of dailyActivities) {
        const cell = {
          date: daily.date,
          watchTime: daily.totalWatchTime,
          videosStarted: daily.videosStarted,
          videosCompleted: daily.videosCompleted,
          intensity: heatmap.calculateIntensity(
            daily.totalWatchTime,
            daily.videosCompleted,
          ),
          color: heatmap.getColorForIntensity(
            heatmap.calculateIntensity(
              daily.totalWatchTime,
              daily.videosCompleted,
            ),
          ),
          hourlyActivity: daily.hourlyBreakdown.map((h) => ({
            hour: h.hour,
            watchTime: h.watchTime,
            intensity: heatmap.calculateIntensity(h.watchTime, h.videosWatched),
          })),
          subjects: daily.subjectBreakdown.map((s) => ({
            subjectId: s.subjectId,
            watchTime: s.watchTime,
            videosWatched: s.videosWatched,
          })),
        };

        heatmap.cells.push(cell);
        await this.updateMonthlyBreakdown(heatmap, daily.date, cell);
      }

      // സംഗ്രഹം അപ്ഡേറ്റ് ചെയ്യുക
      await this.updateSummary(heatmap);
      heatmap.summary.currentStreak = heatmap.calculateCurrentStreak();
      heatmap.summary.longestStreak = Math.max(
        heatmap.summary.longestStreak || 0,
        heatmap.summary.currentStreak,
      );
      heatmap.summary.consistencyScore = heatmap.calculateConsistencyScore();

      await heatmap.save();
      return heatmap;
    } catch (error) {
      console.error("Recalculate error:", error);
      throw error;
    }
  }
}

module.exports = new HeatmapService();
