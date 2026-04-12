const Progress = require('../models/Progress');

exports.getProgress = async (req, res) => {
  try {
    const { uid } = req.query;

    if (!uid) {
      return res.status(400).json({ success: false, message: 'User ID (uid) is required' });
    }

    let progress = await Progress.findOne({ uid });

    if (!progress) {
      progress = new Progress({
        uid,
        percentage: 0,
        currentMilestone: "Not started",
        targetRole: "Full Stack Developer",
        missingSkills: [],
        skillStrength: new Map([
          ["React", 30],
          ["Node.js", 20],
          ["Python", 10],
          ["Git", 50],
          ["UI/UX", 15],
          ["Docker", 5]
        ]),
        milestones: [],
        estimatedDays: 90,
        totalStudyHours: 0
      });

      await progress.save();
      console.log(`New progress created for uid: ${uid}`);
    }

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching progress',
      error: error.message
    });
  }
};