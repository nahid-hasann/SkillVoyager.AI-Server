const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');

// VERSION: 1.2
// Create a new ticket
router.post('/', async (req, res) => {
  try {
    const ticket = new Ticket(req.body);
    await ticket.save();
    res.status(201).json({ success: true, ticket });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get all tickets
router.get('/', async (req, res) => {
  try {
    const { category, status, userId } = req.query;
    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (userId) query.userId = userId;

    const tickets = await Ticket.find(query).sort({ createdAt: -1 });
    res.json({ success: true, tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single ticket
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// [POST] Add comment
router.post('/:id/comments', async (req, res) => {
  try {
    const { userId, userName, userAvatar, text, isAdmin, attachment } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    ticket.comments.push({ userId, userName, userAvatar, text, isAdmin, attachment });
    if (isAdmin === true || isAdmin === 'true') ticket.status = 'In Progress';
    
    await ticket.save();
    res.json({ success: true, ticket });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// [PATCH] Update ticket OR handle comment actions (edit/delete)
router.patch('/:id', async (req, res) => {
  try {
    const { action, commentId, text, userId, isAdmin } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    const adminCheck = String(isAdmin) === 'true';

    if (action === 'editComment') {
      console.log(`[BACKEND] ATOMIC EDIT: Ticket=${req.params.id}, Comment=${commentId}`);
      
      const query = { _id: req.params.id, "comments._id": commentId };
      const update = { $set: { "comments.$.text": text } };
      
      // If not admin, verify ownership in query
      const adminCheck = String(isAdmin) === 'true';
      if (!adminCheck) query["comments.userId"] = userId;

      const updatedTicket = await Ticket.findOneAndUpdate(query, update, { new: true });
      if (!updatedTicket) return res.status(403).json({ success: false, message: 'Unauthorized or not found' });
      
      return res.json({ success: true, ticket: updatedTicket });
    } 
    else if (action === 'deleteComment') {
      console.log(`[BACKEND] ATOMIC DELETE: Ticket=${req.params.id}, Comment=${commentId}`);
      
      const query = { _id: req.params.id };
      const update = { $pull: { comments: { _id: commentId } } };
      
      // If not admin, we need to verify ownership before pulling or use a more complex pull
      // To keep it simple and safe for non-admins:
      if (String(isAdmin) !== 'true') {
         // Verify ownership first
         const t = await Ticket.findById(req.params.id);
         const c = t.comments.id(commentId);
         if (!c || String(c.userId) !== String(userId)) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
         }
      }

      const updatedTicket = await Ticket.findByIdAndUpdate(req.params.id, update, { new: true });
      return res.json({ success: true, ticket: updatedTicket });
    }
    else {
      // Standard ticket field updates (status, priority, etc.)
      const { action: _a, commentId: _c, ...updateFields } = req.body;
      const updatedTicket = await Ticket.findByIdAndUpdate(req.params.id, updateFields, { new: true });
      return res.json({ success: true, ticket: updatedTicket });
    }
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
