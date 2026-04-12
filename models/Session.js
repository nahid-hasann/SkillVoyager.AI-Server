const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  meetingLink: {
    type: String,
    required: true
  },
  meetingPlatform: {
    type: String,
    enum: ['Zoom', 'Google Meet', 'YouTube', 'Discord', 'Other'],
    default: 'Google Meet'
  },
  recordingUrl: {
    type: String,
    default: ''
  },
  thumbnail: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'recorded'],
    default: 'upcoming'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Session', sessionSchema);
