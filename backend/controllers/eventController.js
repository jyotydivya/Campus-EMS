const Event = require('../models/Event');
const { Registration } = require('../models/Registration');
const { sendNotificationToTopic } = require('../utils/firebase');

// GET /api/events — public, approved only (students)
exports.getEvents = async (req, res) => {
  try {
    const { category, search, upcoming } = req.query;
    const filter = { status: 'approved' };
    if (category) filter.category = category;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
    if (upcoming === 'true') filter.startDate = { $gte: new Date() };

    const events = await Event.find(filter)
      .populate('category', 'name color icon')
      .populate('organizer', 'name email')
      .sort({ startDate: 1 });
    res.json({ events });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/events/:id
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('category', 'name color icon')
      .populate('organizer', 'name email department');
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/events — organizer creates event
exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user._id, status: 'pending' });
    res.status(201).json({ event, message: 'Event submitted for admin approval.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/events/:id — organizer updates own event (only if pending)
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, organizer: req.user._id });
    if (!event) return res.status(404).json({ message: 'Event not found or not your event.' });
    if (!['pending', 'rejected'].includes(event.status))
      return res.status(400).json({ message: 'Only pending/rejected events can be edited.' });

    Object.assign(event, req.body);
    event.status = 'pending'; // re-submit for approval
    await event.save();
    res.json({ event });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/events/:id — organizer cancels event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, organizer: req.user._id });
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    event.status = 'cancelled';
    await event.save();

    // Notify registered students
    await sendNotificationToTopic(
      `event_${event._id}`,
      `Event Cancelled: ${event.title}`,
      'This event has been cancelled by the organizer.'
    );

    res.json({ message: 'Event cancelled.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/events/organizer/mine — organizer's own events
exports.getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id })
      .populate('category', 'name color icon')
      .sort({ createdAt: -1 });
    res.json({ events });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/events/:id/participants — organizer sees who registered
exports.getParticipants = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, organizer: req.user._id });
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    const registrations = await Registration.find({ event: req.params.id, status: 'confirmed' })
      .populate('student', 'name email rollNumber department')
      .sort({ createdAt: -1 });

    res.json({ registrations, count: registrations.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
