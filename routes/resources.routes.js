const express = require('express');
const router = express.Router();

// Static resources data
const resources = [
    { id: 1, title: "freeCodeCamp", url: "https://www.freecodecamp.org", description: "Free coding courses and certifications", type: "Platform", icon: "💻" },
    { id: 2, title: "Coursera", url: "https://www.coursera.org", description: "University-level courses from top institutions", type: "Platform", icon: "🎓" },
    { id: 3, title: "MDN Web Docs", url: "https://developer.mozilla.org", description: "Comprehensive web development documentation", type: "Documentation", icon: "📚" },
    { id: 4, title: "LeetCode", url: "https://leetcode.com", description: "Practice coding problems for interviews", type: "Practice", icon: "⚡" },
    { id: 5, title: "YouTube - Traversy Media", url: "https://www.youtube.com/@TraversyMedia", description: "Web development tutorials and crash courses", type: "Video", icon: "🎥" },
    { id: 6, title: "GitHub", url: "https://github.com", description: "Host your code and collaborate with others", type: "Tool", icon: "🔧" }
];

// GET /api/resources
router.get('/', (req, res) => {
    res.json({ success: true, data: resources });
});

module.exports = router;
