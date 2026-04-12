// RESTART TRIGGER FOR ROUTES SYNC: 2026-03-26 v4
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');

require('dotenv').config();

// ── Stripe ────────────────────────────────────────────────────────────────────
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
// ─────────────────────────────────────────────────────────────────────────────

const recommendationRoutes = require('./routes/recommendation.routes.js');
const roadmapRoutes = require('./routes/roadmap.routes.js');
const trendingRoutes = require('./routes/trending.routes.js');
const analysisRoutes = require('./routes/analysis.routes.js');
const onboardingRoutes = require('./routes/onboarding.routes.js');
const progressRoutes = require('./routes/progress.routes.js');
const tipsRoutes = require('./routes/tips.routes.js');
const resourcesRoutes = require('./routes/resources.routes.js');
const bookmarksRoutes = require('./routes/bookmarks.routes.js');
const notificationsRoutes = require('./routes/notifications.routes.js');
const mentorRoutes = require('./routes/mentor.routes.js');
const quizRoutes = require('./routes/quiz.routes.js');
const sessionRoutes = require('./routes/session.routes.js');
const announcementRoutes = require('./routes/announcement.routes.js');
const ticketRoutes = require('./routes/ticket.routes.js');
const userRoutes = require('./routes/user.routes.js');
const dashboardRoutes = require('./routes/dashboard.routes.js');
const User = require('./models/User');
const transporter = require('./config/email.js');

// ── NEW: Enrollment Model (course payment এর জন্য) ────────────────────────────
const Enrollment = require('./models/Enrollment'); // নিচে models/Enrollment.js বানাতে হবে
// ─────────────────────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://skill-voyager-ai.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use('/api/leaderboard', require('./routes/leaderboard.routes'));
app.use('/api/contact', require('./routes/contact'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'SkillVoyager AI Backend is Running!' });
});

// ── Stripe: Payment Intent (পুরনো — Elements-based, রেখে দেওয়া হয়েছে) ─────────
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, courseId, courseTitle, planName, billingCycle } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ error: 'amount এবং currency দরকার' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        courseId:     String(courseId     || ''),
        courseTitle:  String(courseTitle  || ''),
        planName:     String(planName     || ''),
        billingCycle: String(billingCycle || ''),
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── NEW: Stripe Checkout Session (redirect-based, ScholarStream-এর মতো) ───────
app.post('/api/create-course-checkout-session', async (req, res) => {
  try {
    const { courseId, courseTitle, amount, currency, userEmail } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ error: 'amount এবং currency দরকার' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: currency || 'bdt',
            product_data: {
              name: courseTitle || 'SkillVoyager Course',
              description: 'SkillVoyager Course Enrollment — Lifetime Access',
            },
            unit_amount: amount, // frontend থেকে price * 100 পাঠাতে হবে
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/course-payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.CLIENT_URL}/courses`,
      metadata: {
        courseId:    String(courseId    || ''),
        courseTitle: String(courseTitle || ''),
        userEmail:   String(userEmail   || ''),
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Course Checkout Session Error:', err.message);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// ── NEW: Course Payment Success (Stripe redirect থেকে ফিরে enrollment save) ───
app.patch('/api/course-payment-success', async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID missing' });
    }

    // Stripe থেকে session verify করো
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // Duplicate enrollment রোধ করো
    const alreadyEnrolled = await Enrollment.findOne({
      transactionId: session.payment_intent,
    });
    if (alreadyEnrolled) {
      return res.json({ success: true, message: 'Already enrolled' });
    }

    // DB তে enrollment save করো
    const enrollmentData = {
      courseId:      session.metadata.courseId,
      courseTitle:   session.metadata.courseTitle,
userEmail: session.metadata.userEmail || 'guest@skillvoyager.ai',
      amountPaid:    session.amount_total / 100,
      paymentStatus: 'paid',
      transactionId: session.payment_intent,
      enrolledAt:    new Date(),
    };

    await Enrollment.create(enrollmentData);
    console.log('✓ Course enrollment saved:', enrollmentData.courseTitle, '|', enrollmentData.userEmail);

    res.json({ success: true });
  } catch (error) {
    console.error('Course payment processing error:', error);
    res.status(500).json({ message: 'Payment processing failed' });
  }
});
// ─────────────────────────────────────────────────────────────────────────────

// ── Leaderboard ───────────────────────────────────────────────────────────────
app.get('/api/leaderboard', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json([]);
    }
    const users = await User.find(
      {},
      'displayName email photoURL points onboarding.institution'
    )
      .sort({ points: -1 })
      .limit(100);
    res.status(200).json(users);
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



app.get("/api/transactions", async (req, res) => {

  try {

    const result = await Enrollment
      .find({ paymentStatus: "paid" })
      .sort({ enrolledAt: -1 });

    res.send(result);

  } catch (error) {

    console.error(error);
    res.status(500).send({ message: "Failed to fetch transactions" });

  }

});

// ── Contact form ──────────────────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: 'All fields required' });
    }

    await transporter.sendMail({
      from:    `"SkillVoyager Contact" <${process.env.EMAIL_USER}>`,
      to:      process.env.EMAIL_USER,
      replyTo: email,
      subject: `📩 New Contact Message: ${subject}`,
      html: `
        <h2>New Contact Message from SkillVoyager</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>From Email:</b> <a href="mailto:${email}">${email}</a></p>
        <p><b>Subject:</b> ${subject}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
        <hr/>
        <small>SkillVoyager.AI Contact System</small>
      `,
    });

    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

// ── Save or update user on login (Firebase) ───────────────────────────────────
app.post('/api/users', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: false, message: 'Database not connected' });
    }

    const { uid, email, displayName, photoURL, institute } = req.body || {};

    if (!uid) {
      return res.status(400).json({ success: false, message: 'uid is required' });
    }

    let existingUser = await User.findOne({ uid: String(uid) });
    let streakUpdate = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (existingUser) {
      let lastStreakDate = existingUser.lastStreakDate;
      if (lastStreakDate) {
        lastStreakDate = new Date(lastStreakDate);
        lastStreakDate.setHours(0, 0, 0, 0);

        const diffTime = today - lastStreakDate;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          streakUpdate.streak = (existingUser.streak || 0) + 1;
          streakUpdate.lastStreakDate = today;
        } else if (diffDays > 1) {
          streakUpdate.streak = 1;
          streakUpdate.lastStreakDate = today;
        } else if (diffDays === 0) {
          if (!existingUser.streak || existingUser.streak === 0) {
            streakUpdate.streak = 1;
            streakUpdate.lastStreakDate = today;
          }
        }
      } else {
        streakUpdate.streak = 1;
        streakUpdate.lastStreakDate = today;
      }
    } else {
      streakUpdate.streak = 1;
      streakUpdate.lastStreakDate = today;
    }

    const update = {
      lastLoginAt: new Date(),
      ...streakUpdate,
      ...(email       != null && { email:                        String(email)       }),
      ...(displayName != null && { displayName:                  String(displayName) }),
      ...(photoURL    != null && { photoURL:                     String(photoURL)    }),
      ...(institute   != null && { 'onboarding.institution':     String(institute)   }),
      ...(email === 'admin@skillvoyager.ai' && { role: 'admin' }),
    };

    const user = await User.findOneAndUpdate(
      { uid: String(uid) },
      { $set: update },
      { new: true, upsert: true, runValidators: false }
    );

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('Save user error:', err.message || err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── Feature routes ────────────────────────────────────────────────────────────
// Feature routes
app.use('/api/sessions', sessionRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/roadmap',         roadmapRoutes);
app.use('/api/trending',        trendingRoutes);
app.use('/api/analysis',        analysisRoutes);
app.use('/api/onboarding',      onboardingRoutes);
app.use('/api/progress',        progressRoutes);
app.use('/api/tips',            tipsRoutes);
app.use('/api/resources',       resourcesRoutes);
app.use('/api/user/bookmarks',  bookmarksRoutes);
app.use('/api/user/onboarding', onboardingRoutes);
app.use('/api/user/progress', progressRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/mentorship', mentorRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/user', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ── Connect MongoDB and start server ──────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✓ Successfully connected to MongoDB Atlas via Mongoose!');
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    app.listen(PORT, () => {
      console.log(`⚠️ Server running without DB on port ${PORT}`);
    });
  });