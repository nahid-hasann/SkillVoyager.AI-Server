const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
    default: 100
  },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'graded'],
    default: 'graded'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
