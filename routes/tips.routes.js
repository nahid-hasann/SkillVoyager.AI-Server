const express = require('express');
const router = express.Router();

// Static tips data
const tips = [
    { id: 1, title: "Pomodoro Technique", content: "Study for 25 minutes, take a 5-minute break. Repeat 4 times, then take a longer break.", category: "Study Tips", icon: "⏰" },
    { id: 2, title: "Active Recall", content: "Test yourself regularly instead of just re-reading notes. This strengthens memory retention.", category: "Study Tips", icon: "🧠" },
    { id: 3, title: "Spaced Repetition", content: "Review material at increasing intervals to move information into long-term memory.", category: "Study Tips", icon: "📅" },
    { id: 4, title: "Set SMART Goals", content: "Make goals Specific, Measurable, Achievable, Relevant, and Time-bound for better success.", category: "Career Advice", icon: "🎯" },
    { id: 5, title: "Build a Portfolio", content: "Showcase your projects on GitHub, personal website, or portfolio platforms to attract employers.", category: "Career Advice", icon: "💼" },
    { id: 6, title: "Network Actively", content: "Connect with professionals on LinkedIn, attend meetups, and engage in online communities.", category: "Career Advice", icon: "🤝" },
    { id: 7, title: "Stay Consistent", content: "Small daily progress is better than irregular intense study sessions. Consistency builds habits.", category: "Motivation", icon: "🔥" },
    { id: 8, title: "Celebrate Small Wins", content: "Acknowledge every milestone you complete. It keeps you motivated for the long journey.", category: "Motivation", icon: "🎉" }
];

// GET /api/tips
router.get('/', (req, res) => {
    res.json({ success: true, data: tips });
});

module.exports = router;
