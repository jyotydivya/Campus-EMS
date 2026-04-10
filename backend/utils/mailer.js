// utils/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // use an App Password for Gmail
  },
});

// ------------------------------------------------------------------
// Helpers: branded HTML email templates
// ------------------------------------------------------------------
const emailWrapper = (title, bodyHtml) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:32px 40px;text-align:center;">
              <div style="font-size:28px;margin-bottom:6px;">🎓</div>
              <div style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.5px;">Campus EMS</div>
              <div style="color:rgba(255,255,255,0.75);font-size:13px;margin-top:4px;">Campus Event Management System</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8f9ff;padding:20px 40px;text-align:center;border-top:1px solid #e8eaf6;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">This is an automated message from Campus EMS. Please do not reply to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Template: Booking confirmation
const bookingConfirmationHtml = ({ studentName, eventTitle, startDate, venue, isPaid, price, ticketId }) =>
  emailWrapper(
    `Registration Confirmed: ${eventTitle}`,
    `
    <h2 style="margin:0 0 8px;color:#1f2937;font-size:22px;">🎟️ You're Registered!</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">Hi <strong>${studentName}</strong>, your spot is confirmed.</p>

    <div style="background:#f0f0ff;border-left:4px solid #4F46E5;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
      <div style="font-size:18px;font-weight:700;color:#1f2937;margin-bottom:12px;">${eventTitle}</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;color:#6b7280;font-size:14px;width:120px;">📅 Date</td>
          <td style="padding:6px 0;color:#1f2937;font-size:14px;font-weight:600;">${startDate}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#6b7280;font-size:14px;">📍 Venue</td>
          <td style="padding:6px 0;color:#1f2937;font-size:14px;font-weight:600;">${venue}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#6b7280;font-size:14px;">💳 Entry Fee</td>
          <td style="padding:6px 0;color:#1f2937;font-size:14px;font-weight:600;">${isPaid ? `₹${price}` : 'Free'}</td>
        </tr>
        ${ticketId ? `
        <tr>
          <td style="padding:6px 0;color:#6b7280;font-size:14px;">🆔 Ticket ID</td>
          <td style="padding:6px 0;color:#4F46E5;font-size:13px;font-family:monospace;">${ticketId}</td>
        </tr>` : ''}
      </table>
    </div>

    <div style="background:#ecfdf5;border-radius:8px;padding:16px 20px;margin-bottom:24px;display:flex;align-items:center;gap:12px;">
      <span style="font-size:20px;">✅</span>
      <span style="color:#065f46;font-size:14px;font-weight:500;">Your QR ticket is ready! Open the app → <strong>My Tickets</strong> to view it at the entry gate.</span>
    </div>

    <p style="color:#6b7280;font-size:14px;margin:0;">See you at the event! 🎉</p>
    `
  );

// Template: Cancellation confirmation
const cancellationHtml = ({ studentName, eventTitle, startDate, venue }) =>
  emailWrapper(
    `Registration Cancelled: ${eventTitle}`,
    `
    <h2 style="margin:0 0 8px;color:#1f2937;font-size:22px;">❌ Registration Cancelled</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">Hi <strong>${studentName}</strong>, your registration has been cancelled.</p>

    <div style="background:#fff5f5;border-left:4px solid #ef4444;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
      <div style="font-size:18px;font-weight:700;color:#1f2937;margin-bottom:12px;">${eventTitle}</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;color:#6b7280;font-size:14px;width:120px;">📅 Date</td>
          <td style="padding:6px 0;color:#1f2937;font-size:14px;font-weight:600;">${startDate}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#6b7280;font-size:14px;">📍 Venue</td>
          <td style="padding:6px 0;color:#1f2937;font-size:14px;font-weight:600;">${venue}</td>
        </tr>
      </table>
    </div>

    <p style="color:#6b7280;font-size:14px;margin:0 0 8px;">Your ticket has been invalidated. If you change your mind, you can re-register before the deadline (subject to availability).</p>
    <p style="color:#9ca3af;font-size:13px;margin:0;">If you did not request this cancellation, please contact your event organizer immediately.</p>
    `
  );

/**
 * Send an email
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[Nodemailer] Warning: EMAIL_USER or EMAIL_PASS not configured in .env. Skipping email to: ' + to);
    return null;
  }
  try {
    const info = await transporter.sendMail({
      from: `"Campus EMS" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('[Nodemailer] Email sent successfully. Message ID:', info.messageId, '| To:', to);
    return info;
  } catch (err) {
    console.error('[Nodemailer] Error sending email to', to, '—', err.message);
    return null;
  }
};

module.exports = { 
  sendEmail, 
  templates: { 
    bookingConfirmationHtml, 
    cancellationHtml 
  } 
};
