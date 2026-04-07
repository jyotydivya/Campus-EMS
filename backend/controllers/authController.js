const jwt = require('jsonwebtoken');
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

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered.' });

    const user = await User.create({ name, email, password, role: safeRole, rollNumber, department });
    const token = signToken(user._id);

    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    if (!user.isActive) return res.status(403).json({ message: 'Account is deactivated.' });

    const token = signToken(user._id);
    user.password = undefined;
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
