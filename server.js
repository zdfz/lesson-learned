require('dotenv').config();
const express = require('express');
const path = require('path');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM = process.env.SENDGRID_FROM;
const RECIPIENTS = [
  'hlemah.AlFaraj@starlinks-me.com',
  'Daren.AbuGhoush@starlinks-me.com',
  'AbdulrhmanAlshehri.ai@gmail.com',
];

sgMail.setApiKey(SENDGRID_API_KEY);

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Timeline change notification endpoint
app.post('/api/notify-timeline-change', async (req, res) => {
  console.log('Received timeline change notification:', req.body);
  const lesson = req.body;
  if (!lesson || !lesson.Customer || !lesson.Timeline) {
    return res.status(400).json({ error: 'Missing lesson data' });
  }

  const subject = `Timeline Changed: ${lesson.Customer || ''}, ${lesson.Challenge || ''}`;
  const body =
    `The timeline for the following lesson has been changed:\n\n` +
    `Challenge: ${lesson.Challenge || ''}\n` +
    `Description: ${lesson.Description || ''}\n` +
    `Platform: ${lesson.Platform || ''}\n` +
    `Customer: ${lesson.Customer || ''}\n` +
    `Owner: ${lesson.Owner || ''}\n` +
    `Solution: ${lesson.Solution || ''}\n` +
    `Status: ${lesson.Status || ''}\n` +
    `Timeline: ${lesson.Timeline}`;

  // Improved HTML email for new columns
  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f6faf8; padding: 24px; color: #234c36;">
      <h2 style="color: #1f6a4a;">Timeline Changed for a Lesson</h2>
      <p style="font-size: 1.1em;">The timeline for the following lesson has been <b>changed</b>:</p>
      <table style="border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(31,106,74,0.06);">
        <tbody>
          <tr><td style="padding:8px 16px; font-weight:600;">Challenge</td><td style="padding:8px 16px;">${lesson.Challenge || ''}</td></tr>
          <tr><td style="padding:8px 16px; font-weight:600;">Description</td><td style="padding:8px 16px;">${lesson.Description || ''}</td></tr>
          <tr><td style="padding:8px 16px; font-weight:600;">Platform</td><td style="padding:8px 16px;">${lesson.Platform || ''}</td></tr>
          <tr><td style="padding:8px 16px; font-weight:600;">Customer</td><td style="padding:8px 16px;">${lesson.Customer || ''}</td></tr>
          <tr><td style="padding:8px 16px; font-weight:600;">Owner</td><td style="padding:8px 16px;">${lesson.Owner || ''}</td></tr>
          <tr><td style="padding:8px 16px; font-weight:600;">Solution</td><td style="padding:8px 16px;">${lesson.Solution || ''}</td></tr>
          <tr><td style="padding:8px 16px; font-weight:600;">Status</td><td style="padding:8px 16px;">${lesson.Status || ''}</td></tr>
          <tr><td style="padding:8px 16px; font-weight:600; background:#e4ede9;">Timeline</td><td style="padding:8px 16px; background:#e4ede9; font-weight:600; color:#1f6a4a;">${lesson.Timeline}</td></tr>
        </tbody>
      </table>
      <p style="margin-top: 24px; color: #256c3a; font-size: 1em;">This is an automated notification from the Lessons Learned system.<br>If you have any questions, please contact your administrator.</p>
    </div>
  `;

  try {
    await sgMail.send({
      to: RECIPIENTS,
      from: SENDGRID_FROM,
      subject,
      text: body,
      html: htmlBody,
    });
    console.log('Timeline change notification email sent for:', lesson.Customer, '| Timeline:', lesson.Timeline);
    res.json({ success: true });
  } catch (err) {
    console.error('SendGrid error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 