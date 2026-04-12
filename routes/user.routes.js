// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');

// // POST /api/user/onboarding
// router.post('/onboarding', async (req, res) => {
//     try {
//         const { uid, role, education, institution, bio, skills, targetCareer, timeline } = req.body;

//         if (!uid) {
//             return res.status(400).json({ success: false, message: 'User ID is required' });
//         }

//         const onboardingData = {
//             role,
//             education,
//             institution,
//             bio,
//             skills,
//             targetCareer,
//             timeline,
//             completed: true
//         };

//         const user = await User.findOneAndUpdate(
//             { uid: String(uid) },
//             { $set: { onboarding: onboardingData } },
//             { new: true, upsert: true }
//         );

//         res.status(200).json({ success: true, user });
//     } catch (err) {
//         console.error('Onboarding update error:', err);
//         res.status(500).json({ success: false, message: 'Server error' });
//     }
// });

// // GET /api/user/profile/:uid
// router.get('/profile/:uid', async (req, res) => {
//     try {
//         const user = await User.findOne({ uid: req.params.uid });
//         if (!user) {
//             return res.status(404).json({ success: false, message: 'User not found' });
//         }
//         res.status(200).json({ success: true, user });
//     } catch (err) {
//         res.status(500).json({ success: false, message: 'Server error' });
//     }
// });

// // PATCH /api/user/profile/:uid
// router.patch('/profile/:uid', async (req, res) => {
//     try {
//         const user = await User.findOneAndUpdate(
//             { uid: req.params.uid },
//             { $set: req.body },
//             { new: true }
//         );
//         res.status(200).json({ success: true, user });
//     } catch (err) {
//         res.status(500).json({ success: false, message: 'Server error' });
//     }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/user/onboarding
router.post('/onboarding', async (req, res) => {
    try {
        const { uid, role, education, institution, bio, skills, targetCareer, timeline } = req.body;

        if (!uid) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const onboardingData = {
            role, education, institution, bio, skills, targetCareer, timeline, completed: true
        };

        const user = await User.findOneAndUpdate(
            { uid: String(uid) },
            { $set: { onboarding: onboardingData } },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, user });
    } catch (err) {
        console.error('Onboarding update error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/user/profile/:uid
router.get('/profile/:uid', async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.uid });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PATCH /api/user/profile/:uid
router.patch('/profile/:uid', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { uid: req.params.uid },
            { $set: req.body },
            { new: true }
        );
        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/user/ (ADMIN - Fetch all users)
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-__v');
        res.status(200).json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/user/issue-certificate (ADMIN)
router.post('/issue-certificate', async (req, res) => {
    try {
        const { uid, title, issuer } = req.body;
        if (!uid || !title) return res.status(400).json({ success: false, message: 'UID and Title required' });

        const certId = `SV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const newCert = {
            title,
            issuer: issuer || 'SkillVoyager.AI Official',
            date: new Date(),
            certId
        };

        const user = await User.findOneAndUpdate(
            { uid },
            { $push: { officialCertificates: newCert } },
            { new: true }
        );

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, certificate: newCert });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;