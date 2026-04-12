const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    type: {
        type: String,
        enum: ['milestone_complete', 'new_course', 'roadmap_update', 'achievement', 'reminder', 'system'],
        default: 'system'
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: null },
    read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
