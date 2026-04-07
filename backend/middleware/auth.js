const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT and attach user to request
exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ message: 'Not authorized. Token missing.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campus-ems-secret');
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) return res.status(401).json({ message: 'User not found or inactive.' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized. Invalid token.' });
  }
};

// Role-based access control middleware factory
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not allowed to access this route.`,
      });
    }
    next();
  };
};
