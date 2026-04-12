const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    email: { type: String, default: null },
    displayName: { type: String, default: null },
    photoURL: { type: String, default: null },
    phone: { type: String, default: null },
    studentId: { type: String, default: null },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // ── XP & Leaderboard ──────────────────────────────────────────────────────
    points: { type: Number, default: 0 },
    weeklyPoints: { type: Number, default: 0 },   // resets every Monday
    monthlyPoints: { type: Number, default: 0 },   // resets every 1st of month
    streak: { type: Number, default: 0 },   // consecutive active days
    lastStreakDate: { type: Date, default: null }, // last day streak was updated
    previousRank: { type: Number, default: null }, // for ↑↓ rank change badge
    
    gems: { type: Number, default: 0 },
    rewardCount: { type: Number, default: 0 },
    watchHistory: [{
        date: { type: Date, default: Date.now },
        hours: { type: Number, default: 0 }
    }],

    lastLoginAt: { type: Date, default: Date.now },

    onboarding: {
        role: { type: String, default: null },
        education: { type: String, default: null },
        institution: { type: String, default: null },
        bio: { type: String, default: null },
        skills: { type: [String], default: [] },
        targetCareer: { type: String, default: null },
        timeline: { type: String, default: null },
        completed: { type: Boolean, default: false }
    },

    // ── Profile Details ──────────────────────────────────────────────────────
    profile: {
        firstName: { type: String, default: null },
        lastName: { type: String, default: null },
        bio: { type: String, default: null },
        gender: { type: String, default: null },
        dateOfBirth: { type: Date, default: null },
        secondaryEmail: { type: String, default: null },
        languages: { type: String, default: null },
        address: {
            current: { type: String, default: null },
            permanent: { type: String, default: null },
            city: { type: String, default: null },
            country: { type: String, default: null }
        },
        education: [{
            degree: String,
            institution: String,
            year: String,
            result: String
        }],
        importantLinks: [{
            label: String,
            url: String
        }],
        jobProfile: {
            title: String,
            industry: String,
            skills: [String]
        },
        jobExperience: [{
            company: String,
            position: String,
            duration: String,
            description: String
        }],
        hiredStatus: {
            isHired: { type: Boolean, default: false },
            company: String,
            date: Date
        },
        certifications: [{
            name: String,
            issuer: String,
            date: String,
            url: String
        }]
    },

    progress: {
        percentage: { type: Number, default: 0 },
        targetRole: { type: String, default: null },
        currentMilestone: { type: String, default: null },
        missingSkills: { type: [String], default: [] },
        estimatedDays: { type: Number, default: 0 },
        totalStudyHours: { type: Number, default: 0 },
        milestones: [{
            title: String,
            status: { type: String, enum: ['completed', 'current', 'upcoming'], default: 'upcoming' },
            date: String
        }]
    },

    badges: [{
        name: { type: String },
        icon: { type: String },
        description: { type: String },
        unlockedAt: { type: Date, default: Date.now }
    }],

    officialCertificates: [{
        title: String,
        issuer: { type: String, default: 'SkillVoyager.AI Official' },
        date: { type: Date, default: Date.now },
        certId: { type: String, unique: true },
        sharingUrl: String
    }],

    experience: { type: Number, default: 0 },
    rank: { type: String, default: 'Bronze Voyager' },

    bookmarks: {
        tips: [{ type: Number }],
        resources: [{ type: Number }]
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);