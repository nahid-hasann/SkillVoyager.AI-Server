const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  quiz_title: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  skillLevel: {
    type: String,
    required: true,
  },
  total_questions: {
    type: Number,
    required: true,
  },
  questions: [
    {
      id: { type: Number, required: true },
      question: { type: String, required: true },
      options: {
        A: { type: String, required: true },
        B: { type: String, required: true },
        C: { type: String, required: true },
        D: { type: String, required: true },
      },
      correct_answer: { type: String, required: true },
      explanation: { type: String, required: true },
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Quiz', quizSchema);
