const callGemini = require("../services/gemini.service");
const MentorChat = require("../models/MentorChat");

/**
 * Handle user messages to Mentor and store them in DB.
 */
exports.chatWithMentor = async (req, res) => {
    try {
        const { message, sessionId, userContext, uid } = req.body;

        console.log("Chat Request - UID:", uid, "SessionId:", sessionId);

        if (!message || !uid) {
            return res.status(400).json({ message: "Message and User UID are required" });
        }

        const systemPrompt = `You are "SkillVoyager Mentor", a friendly and professional career and study coach.
User Context:
- Target: ${userContext?.career || 'Software Development'}
- Skills: ${userContext?.skills?.join(', ') || 'General curiosity'}

Guidelines:
1. Speak in a mix of English and Bengali (Benglish).
2. Give actionable study tips and keep responses encouraging.
3. Keep answers concise.`;

        // 1. Fetch or create session
        let currentSession;
        if (sessionId && sessionId !== 'null' && sessionId !== 'undefined') {
            currentSession = await MentorChat.findById(sessionId);
        }

        if (!currentSession) {
            console.log("Creating new chat session for UID:", uid);
            currentSession = new MentorChat({
                uid: String(uid),
                title: message.substring(0, 35) + (message.length > 35 ? "..." : ""),
                messages: []
            });
        }

        // 2. Prepare history for AI
        const history = currentSession.messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        })).slice(-8);

        // 3. Call AI
        console.log("AI Mentor: Calling Gemini...");
        const aiText = await callGemini(message, systemPrompt, history);

        // 4. Save interactions
        const userMsg = { role: 'user', text: message, time: new Date() };
        if (userContext?.fileAttached) {
            userMsg.attachment = { name: userContext.fileName };
        }
        
        const aiMsg = { role: 'model', text: aiText, time: new Date() };
        
        currentSession.messages.push(userMsg);
        currentSession.messages.push(aiMsg);
        currentSession.lastUpdated = new Date();
        
        const savedSession = await currentSession.save();
        console.log("Chat Saved successfully. ID:", savedSession._id);

        res.json({ 
            success: true, 
            text: aiText, 
            sessionId: savedSession._id,
            sessionTitle: savedSession.title 
        });

    } catch (error) {
        console.error("AI Mentor Controller Error:", error);
        res.status(500).json({
            success: false,
            message: "AI Mentor Error: " + error.message
        });
    }
};

/**
 * Get all sessions for a user (history list)
 */
exports.getUserSessions = async (req, res) => {
    try {
        const { uid } = req.params;
        console.log("GET Sessions for UID:", uid);
        
        if (!uid) return res.status(400).json({ message: "UID required" });

        const sessions = await MentorChat.find({ uid: String(uid), status: 'active' })
            .select('title lastUpdated createdAt')
            .sort({ lastUpdated: -1 });
        
        console.log(`Found ${sessions.length} sessions for user ${uid}`);
        res.json({ success: true, sessions });
    } catch (err) {
        console.error("Fetch Sessions Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Get a specific session detail
 */
exports.getSessionDetail = async (req, res) => {
    try {
        const { sessionId } = req.params;
        if (!sessionId) return res.status(400).json({ message: "Session ID required" });

        const session = await MentorChat.findById(sessionId);
        if (!session) return res.status(404).json({ message: "Session not found" });
        
        res.json({ success: true, session });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Delete a session
 */
exports.deleteSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        await MentorChat.findByIdAndDelete(sessionId);
        res.json({ success: true, message: "Session purged" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
