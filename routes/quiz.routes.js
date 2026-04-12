const express = require('express');
const { generateQuiz, evaluateQuiz } = require('../controllers/quiz.controller');

const router = express.Router();

// Generate a new quiz
router.post('/generate', generateQuiz);

// Submit and evaluate quiz answers
router.post('/submit', evaluateQuiz);

module.exports = router;
