const express = require('express');
const router = express.Router();
const User = require('../models/User');
const QuizResult = require('../models/QuizResult');
const Assignment = require('../models/Assignment');

router.get('/stats/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Calculate Quiz Stats
    const quizResults = await QuizResult.find({ userEmail: user.email });
    const quizAvg = quizResults.length > 0 
      ? (quizResults.reduce((acc, curr) => acc + curr.percentage, 0) / quizResults.length).toFixed(2)
      : 0;

    // Calculate Assignment Stats
    const assignments = await Assignment.find({ userEmail: user.email });
    const assignmentAvg = assignments.length > 0
      ? (assignments.reduce((acc, curr) => acc + (curr.score/curr.total)*100, 0) / assignments.length).toFixed(2)
      : 0;

    // Watch History (Last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayData = user.watchHistory?.find(w => 
        new Date(w.date).toISOString().split('T')[0] === dateStr
      );
      
      last7Days.push({
        date: dateStr,
        hours: dayData ? dayData.hours : 0
      });
    }

    // Milestones Progress
    const onTimeFinishCount = user.progress?.milestones?.filter(m => m.status === 'completed').length || 0;
    const totalMilestones = user.progress?.milestones?.length || 0;

    res.status(200).json({
      success: true,
      data: {
        quizAvg: parseFloat(quizAvg),
        assignmentAvg: parseFloat(assignmentAvg),
        onTimeFinish: onTimeFinishCount,
        totalMilestones: totalMilestones,
        gems: user.gems || 0,
        rewardCount: user.rewardCount || 0,
        watchHistory: last7Days,
        streak: user.streak || 0,
        points: user.points || 0,
        rank: user.rank || 'Bronze Voyager',
        badges: user.badges || []
      }
    });

  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
