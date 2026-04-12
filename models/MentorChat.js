const mongoose = require('mongoose');

const mentorChatSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    default: "New Strategic Session"
  },
  messages: [{
    role: { type: String, enum: ['user', 'model'], required: true },
    text: { type: String, required: true },
    time: { type: Date, default: Date.now },
    attachment: {
      name: String,
      size: Number,
      type: String
    }
  }],
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('MentorChat', mentorChatSchema);
