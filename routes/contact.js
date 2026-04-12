const express = require('express');
const router = express.Router();
const transporter = require('../config/email'); // ← এখানে ইমপোর্ট

router.post('/send', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }

  try {
    const mailOptions = {
      from: `"Contact - ${name}" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || 'kakolyakhter@gmail.com',
      replyTo: email,
      subject: `New Contact: ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
      html: `
        <h2 style="color: #4f46e5;">New Message from Contact Form</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr style="border: 1px solid #e2e8f0;" />
        <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
        <p style="margin-top: 30px; color: #64748b; font-size: 13px;">
          Sent from SkillVoyager.AI Contact Page
        </p>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact email failed:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

module.exports = router;