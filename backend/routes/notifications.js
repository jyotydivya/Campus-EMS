// routes/notifications.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { sendNotificationToTopic, sendFirebaseEmail } = require('../utils/firebase');
const Event = require('../models/Event');
const { Registration } = require('../models/Registration');

// POST /api/notifications/send — organizer sends push to event registrants
router.post('/send', protect, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { eventId, title, body } = req.body;
    const event = await Event.findOne({ _id: eventId, organizer: req.user._id });
    if (!event && req.user.role !== 'admin')
      return res.status(404).json({ message: 'Event not found or not your event.' });

    // Send push notification to devices
    await sendNotificationToTopic(`event_${eventId}`, title, body);

    // Fetch all active registrations to blast emails
    const registrations = await Registration.find({ event: eventId, status: 'confirmed' }).populate('student', 'email name');
    
    let emailsQueued = 0;
    registrations.forEach(reg => {
      if (reg.student && reg.student.email) {
        sendFirebaseEmail(
          reg.student.email,
          title,
          `<p>Hi ${reg.student.name},</p>
           <p><strong>Reminder from ${event.title}:</strong></p>
           <p>${body.replace(/\n/g, '<br/>')}</p>`
        );
        emailsQueued++;
      }
    });

    res.json({ message: `Notification sent & ${emailsQueued} emails queued!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
