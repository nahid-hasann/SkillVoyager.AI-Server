const express = require("express");
const router = express.Router();
const mentorController = require("../controllers/mentor.controller");

// Chat process
router.post("/chat", mentorController.chatWithMentor);

// History & Sessions
router.get("/sessions/:uid", mentorController.getUserSessions);
router.get("/session/:sessionId", mentorController.getSessionDetail);
router.delete("/session/:sessionId", mentorController.deleteSession);

module.exports = router;
