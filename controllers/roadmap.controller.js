const callGemini = require("../services/gemini.service");
const Roadmap = require("../models/Roadmap");
const User = require('../models/User');
const Notification = require('../models/Notification');
const generateRoadmap = async (req, res) => {
  try {
    const { userEmail, goal, timeline, learningStyle } = req.body;

    if (!goal) {
      return res.status(400).json({ error: "Goal is required" });
    }

    const prompt = `Create a detailed learning roadmap for:
Goal: "${goal}"
Timeline: "${timeline}"
Learning Style: "${learningStyle}"

Please provide:
1. A catchy title for the roadmap.
2. A brief 2-sentence description.
3. 3 to 5 distinct phases.

For each phase, include:
- Phase Name
- Duration (e.g., "Weeks 1-2")
- Description
- 3-5 Key Topics
- 2-3 Recommended Resources (online courses, docs, or platforms)

Return ONLY a JSON object:
{
  "title": "...",
  "description": "...",
  "phases": [
    {
      "phaseName": "...",
      "duration": "...",
      "description": "...",
      "topics": ["...", "..."],
      "resources": ["...", "..."]
    }
  ]
}`;

    console.log("Roadmap Generator: Calling Gemini Service...");
    const responseText = await callGemini(prompt);

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid AI response format");
    }

    const roadmapData = JSON.parse(jsonMatch[0]);

    // Save to database
    const newRoadmap = new Roadmap({
      userEmail: userEmail || "anonymous",
      goal,
      timeline,
      learningStyle,
      ...roadmapData
    });






    await newRoadmap.save();




    // XP: roadmap তৈরি করলে +50 XP
    if (userEmail && userEmail !== "anonymous") {
      try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const u = await User.findOne({ email: userEmail });
        if (u) {
          let newStreak = u.streak || 0;
          if (u.lastStreakDate) {
            const diff = Math.round((today - new Date(u.lastStreakDate)) / 86_400_000);
            if (diff === 1) newStreak += 1;
            else if (diff > 1) newStreak = 1;
          } else { newStreak = 1; }

          await User.findOneAndUpdate(
            { email: userEmail },
            {
              $inc: { points: 50, weeklyPoints: 50, monthlyPoints: 50, experience: 50 },
              $set: { streak: newStreak, lastStreakDate: today }
            }
          );

          // Create Notification
          const newNotif = new Notification({
            userId: u.uid,
            type: 'roadmap_update',
            title: 'New Roadmap Generated',
            message: `You successfully generated a new roadmap: ${roadmapData.title}`,
            link: '/roadmap/generate'
          });
          await newNotif.save();
        }
      } catch (e) { console.error("XP error:", e.message); }
    }


    res.json({
      message: "Roadmap generated successfully",
      roadmap: {
        roadmapData: roadmapData
      }
    });

  } catch (error) {
    console.error("Roadmap Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { generateRoadmap };