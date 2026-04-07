const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { Registration, Ticket } = require('../models/Registration');
const Event = require('../models/Event');
const { sendNotificationToTopic, sendFirebaseEmail } = require('../utils/firebase');

// POST /api/registrations — student registers for event
exports.registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await Event.findById(eventId).populate('category', 'name');
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Only students can register for events.' });
    if (event.status !== 'approved') return res.status(400).json({ message: 'Event is not open for registration.' });
    if (event.isFull) return res.status(400).json({ message: 'Event is full.' });
    if (new Date() > event.registrationDeadline) return res.status(400).json({ message: 'Registration deadline passed.' });

    // Check duplicate or recycle cancelled registration
    let registration = await Registration.findOne({ student: req.user._id, event: eventId });
    
    if (registration) {
      if (registration.status !== 'cancelled') {
        return res.status(400).json({ message: 'Already registered for this event.' });
      }
      // Recycle the cancelled registration
      registration.status = 'confirmed';
      registration.paymentStatus = event.isPaid ? 'pending' : 'not_required';
      await registration.save();
    } else {
      // Create NEW registration
      registration = await Registration.create({ 
        student: req.user._id, 
        event: eventId,
        paymentStatus: event.isPaid ? 'pending' : 'not_required'
      });
    }

    // Increment participant count
    event.currentParticipants += 1;
    await event.save();

    // Generate QR ticket
    const ticketId = uuidv4();
    const qrPayload = JSON.stringify({ ticketId, studentId: req.user._id, eventId, eventTitle: event.title });
    const qrCodeData = await QRCode.toDataURL(qrPayload);

    const ticket = await Ticket.create({
      registration: registration._id,
      student: req.user._id,
      event: eventId,
      ticketId,
      qrCodeData,
      qrPayload,
    });

    // Subscribe to event push topic
    // (FCM topic subscription handled client-side via Firebase SDK)

    // Send confirmation email via Firebase Trigger Email extension
    await sendFirebaseEmail(
      req.user.email,
      `Registration Confirmed: ${event.title}`,
      `<h2>You're registered!</h2>
        <p>Hi ${req.user.name},</p>
        <p>Your registration for <strong>${event.title}</strong> is confirmed.</p>
        <p><strong>Date:</strong> ${new Date(event.startDate).toLocaleString()}</p>
        <p><strong>Venue:</strong> ${event.venue}</p>
        <p>Your QR ticket is attached. Please show it at entry.</p>`
    );

    res.status(201).json({ registration, ticket, message: 'Registered successfully! Check your email for the QR ticket.' });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Already registered.' });
    res.status(500).json({ message: err.message });
  }
};

// GET /api/registrations/my — student's registrations
exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ student: req.user._id })
      .populate({ path: 'event', populate: { path: 'category', select: 'name color icon' } })
      .sort({ createdAt: -1 });
    res.json({ registrations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/tickets/my — student's tickets
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ student: req.user._id })
      .populate({ path: 'event', select: 'title startDate venue status' })
      .sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/tickets/scan — organizer scans QR at entry
exports.scanTicket = async (req, res) => {
  try {
    const { qrPayload } = req.body;
    let parsed;
    try { parsed = JSON.parse(qrPayload); } catch { return res.status(400).json({ message: 'Invalid QR data.' }); }

    const ticket = await Ticket.findOne({ ticketId: parsed.ticketId })
      .populate('student', 'name email rollNumber department')
      .populate('event', 'title startDate venue organizer');

    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });
    if (!ticket.isValid) return res.status(400).json({ message: 'Ticket is no longer valid (Registration was cancelled).' });

    // Only the event organizer can scan
    if (ticket.event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized to scan for this event.' });

    if (ticket.scanned)
      return res.status(400).json({
        message: 'Ticket already scanned.',
        scannedAt: ticket.scannedAt,
        student: ticket.student,
      });

    ticket.scanned = true;
    ticket.scannedAt = new Date();
    ticket.scannedBy = req.user._id;
    await ticket.save();

    res.json({ message: 'Entry approved!', student: ticket.student, event: ticket.event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/registrations/:id — student cancels registration
exports.cancelRegistration = async (req, res) => {
  try {
    const reg = await Registration.findOne({ _id: req.params.id, student: req.user._id });
    if (!reg) return res.status(404).json({ message: 'Registration not found.' });
    if (reg.status === 'cancelled') return res.status(400).json({ message: 'Registration is already cancelled.' });

    reg.status = 'cancelled';
    await reg.save();

    // Invalidate the ticket
    await Ticket.findOneAndUpdate({ registration: reg._id }, { isValid: false });

    // Decrement participant count
    await Event.findByIdAndUpdate(reg.event, { $inc: { currentParticipants: -1 } });

    res.json({ message: 'Registration cancelled.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
