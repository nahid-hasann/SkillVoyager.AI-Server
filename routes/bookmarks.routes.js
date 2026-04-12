const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/user/bookmarks/:userId
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findOne({ uid: String(userId) });
        const bookmarks = user?.bookmarks || { tips: [], resources: [] };
        res.json({ success: true, data: bookmarks });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/user/bookmarks/:userId
router.post('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { type, itemId } = req.body;

        const updateField = type === 'tip' ? 'bookmarks.tips' : 'bookmarks.resources';

        const updatedUser = await User.findOneAndUpdate(
            { uid: String(userId) },
            { $addToSet: { [updateField]: itemId } }, // $addToSet prevents duplicates
            { new: true, upsert: true }
        );

        res.json({ success: true, data: updatedUser.bookmarks });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/user/bookmarks/:userId
router.delete('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { type, itemId } = req.body;

        const updateField = type === 'tip' ? 'bookmarks.tips' : 'bookmarks.resources';

        const updatedUser = await User.findOneAndUpdate(
            { uid: String(userId) },
            { $pull: { [updateField]: itemId } }, // $pull removes item from array
            { new: true }
        );

        res.json({ success: true, data: updatedUser?.bookmarks || { tips: [], resources: [] } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
