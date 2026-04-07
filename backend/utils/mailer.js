// utils/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // use an App Password for Gmail
  },
});

/**
 * Send an email
 * @param {{ to: string, subject: string, html: string }} options
 */
exports.sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER) {
    console.warn('Email not configured. Skipping email send.');
    return;
  }
  try {
    const info = await transporter.sendMail({
      from: `"Campus EMS" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};
