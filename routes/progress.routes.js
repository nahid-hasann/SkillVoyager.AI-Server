const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');

// GET /api/progress
router.get('/', async (req, res) => {
  try {
    const { uid } = req.query;

    if (!uid) {
      return res.status(400).json({ success: false, message: 'User ID (uid) is required' });
    }

    let progress = await Progress.findOne({ uid: String(uid) });

    if (!progress) {
      // Default data + skillStrength
      progress = new Progress({
        uid: String(uid),
        percentage: 0,
        currentMilestone: "Planning Learning Journey",
        targetRole: "Full Stack Developer",
        missingSkills: [],
        skillStrength: new Map([
          ["React", 40],
          ["JavaScript", 40],
          ["Node.js", 40],
          ["Git", 40],
          ["UI/UX", 40],
          ["Python", 40]
        ]),
        milestones: [
          { title: "Onboarding Complete", status: "completed", date: new Date().toISOString().split('T')[0] },
          { title: "First Quiz", status: "upcoming", date: "TBD" }
        ],
        estimatedDays: 90,
        totalStudyHours: 0
      });

      await progress.save();
      console.log(`New progress created for uid: ${uid} with default skillStrength`);
    }

    res.status(200).json({ success: true, data: progress });
  } catch (err) {
    console.error('Progress fetch error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/progress/summary (optional)
router.get('/summary', async (req, res) => {
  try {
    const { uid } = req.query;
    const progress = await Progress.findOne({ uid: String(uid) });

    if (!progress) {
      return res.status(200).json({
        success: true,
        summary: { percentage: 0, currentMilestone: 'Not started', missingSkillsCount: 0 }
      });
    }

    res.status(200).json({
      success: true,
      summary: {
        percentage: progress.percentage,
        targetRole: progress.targetRole,
        currentMilestone: progress.currentMilestone,
        missingSkillsCount: progress.missingSkills.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/progress/skill/:uid (optional — skill score আপডেট)
router.put('/skill/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { skill, score } = req.body;

    if (!skill || typeof score !== 'number' || score < 0 || score > 100) {
      return res.status(400).json({ success: false, message: 'Invalid skill or score' });
    }

    const progress = await Progress.findOne({ uid: String(uid) });
    if (!progress) {
      return res.status(404).json({ success: false, message: 'Progress not found' });
    }

    progress.skillStrength.set(skill, score);
    await progress.save();

    res.status(200).json({
      success: true,
      message: `Skill "${skill}" updated to ${score}%`,
      data: progress
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/progress/milestone/:uid - আপডেট মাইলস্টোন এবং অটো-ক্যালকুলেট পার্সেন্টেজ
router.patch('/milestone/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { milestoneTitle, status } = req.body; // status: 'completed', 'current', 'upcoming'

    const progress = await Progress.findOne({ uid: String(uid) });
    if (!progress) {
      return res.status(404).json({ success: false, message: 'Progress not found' });
    }

    // মাইলস্টোন আপডেট করুন
    const milestoneIndex = progress.milestones.findIndex(m => m.title === milestoneTitle);
    if (milestoneIndex !== -1) {
      progress.milestones[milestoneIndex].status = status;
      if (status === 'completed') {
        progress.milestones[milestoneIndex].date = new Date().toISOString().split('T')[0];

        // Create Notification on completion
        const newNotif = new Notification({
          userId: uid,
          type: 'milestone_complete',
          title: 'Milestone Achievement!',
          message: `Congratulations! You have completed the milestone: ${milestoneTitle}`,
          link: '/dashboard'
        });
        await newNotif.save();
      }
    }

    // অটো-ক্যালকুলেট পার্সেন্টেজ
    const total = progress.milestones.length;
    const completed = progress.milestones.filter(m => m.status === 'completed').length;
    if (total > 0) {
      progress.percentage = Math.round((completed / total) * 100);
    }

    // বুস্ট স্কিল স্ট্রেন্থ বেসড অন মাইলস্টোন টাইটেল (Keyword matching)
    // উদাহরণ: "React Basics" মাইলস্টোন শেষ করলে "react" স্কিল ১০ পয়েন্ট বাড়বে।
    if (milestoneTitle) {
      const keywords = ['react', 'node', 'javascript', 'css', 'html', 'python', 'mongodb', 'docker', 'typescript'];
      const lowerTitle = milestoneTitle.toLowerCase();
      keywords.forEach(key => {
        if (lowerTitle.includes(key)) {
          const cur = progress.skillStrength.get(key) || 0;
          progress.skillStrength.set(key, Math.min(100, cur + 10)); // +10 boost per milestone
        }
      });
    }

    // আপডেট currentMilestone (প্রথম যেটা কমপ্লিট হয়নি)
    const nextMilestone = progress.milestones.find(m => m.status !== 'completed');
    if (nextMilestone) {
      progress.currentMilestone = nextMilestone.title;
      if (nextMilestone.status === 'upcoming') {
        nextMilestone.status = 'current';
      }
    } else if (total > 0) {
      progress.currentMilestone = "All Milestones Completed!";
    }

    await progress.save();

    res.status(200).json({
      success: true,
      message: 'Milestone updated and percentage recalculated',
      percentage: progress.percentage,
      currentMilestone: progress.currentMilestone,
      data: progress
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/progress/save-roadmap - সেভ জেনারেটেড রোডম্যাপ ইনটু মাইলস্টোনস
router.post('/save-roadmap', async (req, res) => {
  try {
    const { uid, roadmapData } = req.body;
    if (!uid || !roadmapData || !roadmapData.phases) {
      return res.status(400).json({ success: false, message: 'Missing required data' });
    }

    const progress = await Progress.findOne({ uid: String(uid) });
    if (!progress) {
      return res.status(404).json({ success: false, message: 'Progress not found' });
    }

    // কনভার্ট ফেজেস টু মাইলস্টোনস
    const newMilestones = roadmapData.phases.map((phase, idx) => ({
      title: phase.phaseName,
      status: idx === 0 ? 'current' : 'upcoming', // প্রথমটা একটিভ থাকবে
      date: 'TBD'
    }));

    progress.milestones = newMilestones;
    progress.currentMilestone = newMilestones[0].title;
    progress.percentage = 0; // রিসেট প্রোগ্রেস ফর নিউ রোডম্যাপ
    progress.targetRole = roadmapData.title || progress.targetRole;

    await progress.save();

    res.status(200).json({
      success: true,
      message: 'Roadmap saved to progress milestones',
      data: progress
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;