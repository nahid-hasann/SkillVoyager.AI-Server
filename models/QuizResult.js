const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  pointsEarned: {
    type: Number,
    default: 0,
  },
  evaluation: [
    {
      question_id: { type: Number, required: true },
      question: { type: String }, // To show on frontend
      userAnswer: { type: String },
      correctAnswer: { type: String },
      isCorrect: { type: Boolean, required: true },
      explanation: { type: String, required: true },
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('QuizResult', quizResultSchema);
