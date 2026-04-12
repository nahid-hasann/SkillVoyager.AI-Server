const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['General', 'Update', 'Event', 'Urgent', 'Course'],
    default: 'General'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  thumbnail: {
    type: String,
    default: ''
  },
  actionLink: {
    type: String,
    default: ''
  },
  actionText: {
    type: String,
    default: 'Read More'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  }
});

module.exports = mongoose.model('Announcement', announcementSchema);
