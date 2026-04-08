const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'campus-ems-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, department } = req.body;

    // Prevent self-assignment of admin role
    const safeRole = role === 'admin' ? 'student' : role || 'student';

    // Optimize: removed findOne to save a DB roundtrip. DB unique index handles duplicates.
    const user = await User.create({ name, email, password, role: safeRole, rollNumber, department });
    const token = signToken(user._id);

    // Mongoose create returns a document. We can send it directly since toJSON handles the password removal.
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already registered.' });
    }
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });

    // Optimize: using .lean() skips slow Mongoose document processing
    const user = await User.findOne({ email }).select('+password').lean();
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    if (!user.isActive) return res.status(403).json({ message: 'Account is deactivated.' });

    const token = signToken(user._id);
    delete user.password; // Remove password from the lean object
    
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

// PATCH /api/auth/fcm-token
exports.updateFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    await User.findByIdAndUpdate(req.user._id, { fcmToken });
    res.json({ message: 'FCM token updated.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
