const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

// Get all sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await Session.find().sort({ startTime: -1 });
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create session (Admin only - simplified for now, usually needs middleware)
router.post('/', async (req, res) => {
  try {
    const session = new Session(req.body);
    await session.save();
    res.status(201).json({ success: true, session });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Update session status or details
router.put('/:id', async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, session });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete session
router.delete('/:id', async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
