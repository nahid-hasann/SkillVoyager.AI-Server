const express = require("express");
const router = express.Router();
const analysisController = require("../controllers/analysis.controller");

router.post("/skill-gap", analysisController.analyzeSkillGap);

module.exports = router;
