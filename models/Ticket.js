const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  userName: String,
  userAvatar: String,
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
    enum: ['General', 'Technical', 'Courses', 'Billing', 'Feature Request'],
    default: 'General'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  attachment: String, // URL to image/file
  comments: [{
    userId: String,
    userName: String,
    userAvatar: String,
    text: String,
    attachment: String,
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
