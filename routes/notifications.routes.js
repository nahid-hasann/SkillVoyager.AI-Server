const express = require('express');
const router = express.Router();
const User = require('../models/User');

const Notification = require('../models/Notification');

// Sample notification types
const NOTIFICATION_TYPES = {
  MILESTONE_COMPLETE: 'milestone_complete',
  NEW_COURSE: 'new_course',
  ROADMAP_UPDATE: 'roadmap_update',
  ACHIEVEMENT: 'achievement',
  REMINDER: 'reminder',
  SYSTEM: 'system'
};

// Get all notifications for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userNotifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      notifications: userNotifications,
      unreadCount: userNotifications.filter(n => !n.read).length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a new notification
router.post('/', async (req, res) => {
  try {
    const { userId, type, title, message, link } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const notification = new Notification({
      userId,
      type,
      title,
      message,
      link: link || null
    });

    await notification.save();

    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Broadcast notification to all users
router.post('/broadcast', async (req, res) => {
  try {
    const { type, title, message, link } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const users = await User.find({}, 'uid');
    const notificationsToCreate = users.map(user => ({
      userId: user.uid,
      type,
      title,
      message,
      link: link || null
    }));

    await Notification.insertMany(notificationsToCreate);

    res.json({
      success: true,
      message: `Broadcast sent to ${users.length} users`,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark all notifications as read
router.put('/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;
    await Notification.updateMany({ userId }, { read: true });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a notification
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Notification.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear all notifications for a user
router.delete('/:userId/clear-all', async (req, res) => {
  try {
    const { userId } = req.params;
    await Notification.deleteMany({ userId });

    res.json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to create sample notifications (for testing)
router.post('/seed/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    const sampleNotifications = [
      {
        id: Date.now().toString() + '1',
        userId,
        type: NOTIFICATION_TYPES.MILESTONE_COMPLETE,
        title: '🎉 Milestone Completed!',
        message: 'You completed "Learn React Basics" milestone',
        link: '/progress',
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now().toString() + '2',
        userId,
        type: NOTIFICATION_TYPES.NEW_COURSE,
        title: '📚 New Course Available',
        message: 'Advanced TypeScript course added to your roadmap',
        link: '/roadmap',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: Date.now().toString() + '3',
        userId,
        type: NOTIFICATION_TYPES.ACHIEVEMENT,
        title: '🏆 Achievement Unlocked',
        message: 'You earned "Fast Learner" badge',
        link: '/dashboard',
        read: true,
        createdAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: Date.now().toString() + '4',
        userId,
        type: NOTIFICATION_TYPES.REMINDER,
        title: '⏰ Daily Reminder',
        message: 'Time to continue your learning journey!',
        link: '/tips-resources',
        read: false,
        createdAt: new Date(Date.now() - 10800000).toISOString()
      }
    ];

    notifications[userId] = sampleNotifications;

    res.json({
      success: true,
      message: 'Sample notifications created',
      notifications: sampleNotifications
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
