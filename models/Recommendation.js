const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: String,
  platform: String,
  link: String,
  reason: String,
});

const recommendationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  courses: [courseSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Recommendation", recommendationSchema);