const callGemini = require("../services/gemini.service");
const Recommendation = require("../models/Recommendation");

exports.generateCourseRecommendations = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userGoal = "Become a MERN Stack Developer";
    const skills = ["HTML", "CSS", "JavaScript"];
    const gaps = ["Node.js", "MongoDB", "React Advanced"];

    const prompt = `
You are a career learning assistant.

User goal: ${userGoal}
Current skills: ${skills.join(", ")}
Skill gaps: ${gaps.join(", ")}

Recommend 5 courses.
Return ONLY valid JSON array. No markdown, no backticks, no explanation.
[
 { "title": "", "platform": "", "link": "", "reason": "", "duration": "", "rating": "" }
]
`;

    const aiResponse = await callGemini(prompt);

    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Invalid AI response format");
    }

    const parsedCourses = JSON.parse(jsonMatch[0]);

    const saved = await Recommendation.create({
      userId,
      courses: parsedCourses,
    });

    return res.status(200).json({ courses: saved.courses });

  } catch (error) {
    console.error("Recommendation error:", error.message);
    res.status(500).json({ message: "Failed to generate recommendations", error: error.message });
  }
};