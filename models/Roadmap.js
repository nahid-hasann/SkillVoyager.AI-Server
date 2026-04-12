const mongoose = require("mongoose");

const phaseSchema = new mongoose.Schema({
    phaseName: String,
    duration: String,
    description: String,
    topics: [String],
    resources: [String],
});

const roadmapSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
    },
    title: String,
    description: String,
    goal: String,
    timeline: String,
    learningStyle: String,
    phases: [phaseSchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Roadmap", roadmapSchema);
