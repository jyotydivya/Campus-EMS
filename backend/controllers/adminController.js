const Event = require('../models/Event');
const User = require('../models/User');
const Category = require('../models/Category');
const { Registration } = require('../models/Registration');
const { sendNotificationToTopic } = require('../utils/firebase');
const { sendEmail } = require('../utils/mailer');

// GET /api/admin/events — all events with filters
exports.getAllEvents = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const events = await Event.find(filter)
      .populate('category', 'name color')
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 });
    res.json({ events });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/events/:id/approve
exports.approveEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', adminNote: '' },
      { new: true }
    ).populate('organizer', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    // Notify organizer by email
    await sendEmail({
      to: event.organizer.email,
      subject: `Event Approved: ${event.title}`,
      html: `<p>Hi ${event.organizer.name},</p><p>Your event <strong>${event.title}</strong> has been approved and is now live!</p>`,
    });

    res.json({ event, message: 'Event approved.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/events/:id/reject
exports.rejectEvent = async (req, res) => {
  try {
    const { reason } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', adminNote: reason },
      { new: true }
    ).populate('organizer', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    await sendEmail({
      to: event.organizer.email,
      subject: `Event Rejected: ${event.title}`,
      html: `<p>Hi ${event.organizer.name},</p><p>Your event <strong>${event.title}</strong> was rejected.</p><p><strong>Reason:</strong> ${reason || 'No reason provided.'}</p>`,
    });

    res.json({ event, message: 'Event rejected.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/stats — dashboard stats
exports.getStats = async (req, res) => {
  try {
    const [totalEvents, pendingEvents, totalUsers, totalRegistrations] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ status: 'pending' }),
      User.countDocuments({ role: 'student' }),
      Registration.countDocuments({ status: 'confirmed' }),
    ]);

    const recentEvents = await Event.find({ status: 'approved' })
      .sort({ startDate: 1 })
      .limit(5)
      .populate('category', 'name color');

    const topEvents = await Registration.aggregate([
      { $group: { _id: '$event', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'event' } },
      { $unwind: '$event' },
      { $project: { eventTitle: '$event.title', count: 1 } },
    ]);

    res.json({ totalEvents, pendingEvents, totalUsers, totalRegistrations, recentEvents, topEvents });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/report — participation report (for download)
exports.getReport = async (req, res) => {
  try {
    const { eventId } = req.query;
    const filter = eventId ? { event: eventId } : {};
    const registrations = await Registration.find({ ...filter, status: 'confirmed' })
      .populate('student', 'name email rollNumber department')
      .populate({ path: 'event', select: 'title startDate venue' })
      .sort({ createdAt: -1 });

    res.json({ registrations, count: registrations.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET/POST/PATCH/DELETE /api/admin/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ category });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ category });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/users — all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
