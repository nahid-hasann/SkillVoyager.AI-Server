const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Progress = require('../models/Progress');  // ← এই লাইনটা যোগ করা হলো (এরর ফিক্স)

// POST /api/onboarding
router.post('/', async (req, res) => {
  try {
    const { uid, role, education, skills, targetCareer, timeline } = req.body;

    if (!uid) {
      return res.status(400).json({ success: false, message: 'uid required' });
    }

    // Clean skill names for map/object keys
    const cleanedSkills = (skills || []).map(skill => ({
      original: skill,
      key: skill
        .toLowerCase()
        .replace(/\./g, '')      // Node.js → nodejs
        .replace(/\s+/g, '-')    // "Version Control" → version-control
        .replace(/[^a-z0-9-]/g, '') // special char remove
    }));

    const updatedUser = await User.findOneAndUpdate(
      { uid: String(uid) },
      { 
        'onboarding.role': role,
        'onboarding.education': education,
        'onboarding.skills': skills,
        'onboarding.targetCareer': targetCareer,
        'onboarding.timeline': timeline,
        'onboarding.completed': true,
        skillStrength: cleanedSkills.reduce((acc, s) => {
          acc[s.key] = 40;
          return acc;
        }, {})
      },
      { new: true, upsert: true }
    );

    // Progress-এও cleaned version save
    await Progress.findOneAndUpdate(
      { uid: String(uid) },
      {
        $set: {
          uid: String(uid),
          targetRole: targetCareer || "Full Stack Developer",
          missingSkills: [],
          skillStrength: cleanedSkills.reduce((acc, s) => {
            acc[s.key] = 40;
            return acc;
          }, {}),
          milestones: [
            { title: "Onboarding Complete", status: "completed", date: new Date().toISOString().split('T')[0] }
          ],
          percentage: 10
        }
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Onboarding save error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/onboarding/:uid — Check onboarding status
router.get('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid: String(uid) });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in DB',
        onboardingCompleted: false
      });
    }

    res.status(200).json({
      success: true,
      onboardingCompleted: user.onboarding?.completed || false,
      data: user.onboarding
    });
  } catch (err) {
    console.error('Get onboarding error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;