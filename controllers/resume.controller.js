const callGemini = require("../services/gemini.service");

exports.generateResume = async (req, res) => {
  try {
    const { name, email, phone, targetRole, currentSkills, experience, education, projects, summary } = req.body;

    if (!name || !targetRole) {
      return res.status(400).json({ message: "Name and target role are required" });
    }

    const prompt = `You are a professional resume writer. Generate a polished, ATS-friendly resume for:

Name: ${name}
Email: ${email || 'N/A'}
Phone: ${phone || 'N/A'}
Target Role: ${targetRole}
Skills: ${currentSkills || 'General technical skills'}
Experience: ${experience || 'Fresh graduate / Entry level'}
Education: ${education || 'Not specified'}
Projects: ${projects || 'None listed'}
Summary from user: ${summary || 'Auto-generate a powerful professional summary'}

Return ONLY a valid JSON object with this structure:
{
  "professionalSummary": "A compelling 3-4 sentence professional summary tailored for ${targetRole}",
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6"],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Duration",
      "points": ["Achievement 1 with metrics", "Achievement 2 with metrics"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "Institution Name",
      "year": "Year"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description with technologies used",
      "link": "github.com/example"
    }
  ],
  "achievements": ["Achievement 1", "Achievement 2"]
}

Make the content professional, impactful, and tailored specifically for ${targetRole} roles. If the user provided experience/projects, enhance them. If not, create realistic placeholder content.`;

    console.log("Resume Generator: Calling Gemini Service...");
    const responseText = await callGemini(prompt);

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        return res.json({ success: true, resume: parsedData });
      }
    } catch (e) {
      console.warn("JSON Parse Fallback:", e.message);
    }

    res.json({ success: false, message: "Could not parse AI response" });

  } catch (error) {
    console.error("Resume Generator Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Resume generation failed: " + error.message
    });
  }
};
