const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

// Get all announcements
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create announcement (Admin only)
router.post('/', async (req, res) => {
  try {
    const announcement = new Announcement(req.body);
    await announcement.save();
    res.status(201).json({ success: true, announcement });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get latest announcement for a quick alert
router.get('/latest', async (req, res) => {
  try {
    const announcement = await Announcement.findOne().sort({ createdAt: -1 });
    res.json({ success: true, announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete announcement
router.delete('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
