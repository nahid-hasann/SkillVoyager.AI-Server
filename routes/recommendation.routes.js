const express = require("express");
const router = express.Router();
const {
  generateCourseRecommendations,
} = require("../controllers/recommendation.controller");

router.post("/courses", generateCourseRecommendations);

module.exports = router;