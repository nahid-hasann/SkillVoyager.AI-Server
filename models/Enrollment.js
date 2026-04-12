const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  courseId:      { type: String, required: true },
  courseTitle:   { type: String },
  userEmail:     { type: String, required: true },
  amountPaid:    { type: Number },
  paymentStatus: { type: String, default: 'paid' },
  transactionId: { type: String, unique: true },
  enrolledAt:    { type: Date, default: Date.now },
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);