const callGemini = require("../services/gemini.service");

exports.analyzeSkillGap = async (req, res) => {
    try {
        const { targetRole, currentSkills } = req.body;

        if (!targetRole || !currentSkills) {
            return res.status(400).json({ message: "Target role and current skills are required" });
        }

        const promptTemplate = `Analyze the skill gap for:
Target Role: "${targetRole}"
Current Skills: "${currentSkills}"

Please provide exactly:
1. **Summary**: A powerful 2-line assessment of the transition.
2. **Missing Skills**: List only the most critical 5-7 skills needed.
3. **Personalized Guide**: A professional markdown-formatted learning roadmap.
4. **Timeframe**: Realistic estimate in months.

Return ONLY a JSON object:
{
  "summary": "...",
  "missingSkills": ["...", "..."],
  "guide": "...",
  "estimatedMonths": 0
}`;

        console.log("Calling Gemini Service (Skill Gap)...");
        const responseText = await callGemini(promptTemplate);
        console.log("AI Response received (length):", responseText.length);

        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsedData = JSON.parse(jsonMatch[0]);
                return res.json(parsedData);
            }
        } catch (e) {
            console.warn("JSON Parse Fallback:", e.message);
        }

        res.json({
            summary: "Analysis complete. See the guide below.",
            guide: responseText,
            missingSkills: [],
            estimatedMonths: "Analyze guide for details"
        });

    } catch (error) {
        console.error("DEBUG - SKILL GAP ERROR:", error.message);
        res.status(500).json({
            message: "Failed to perform skill gap analysis",
            details: error.message
        });
    }
};
