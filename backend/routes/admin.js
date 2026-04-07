// routes/admin.js
const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const guard = [protect, authorize('admin')];

router.get('/events', ...guard, admin.getAllEvents);
router.patch('/events/:id/approve', ...guard, admin.approveEvent);
router.patch('/events/:id/reject', ...guard, admin.rejectEvent);
router.get('/stats', ...guard, admin.getStats);
router.get('/report', ...guard, admin.getReport);
router.get('/users', ...guard, admin.getUsers);
router.patch('/users/:id/role', ...guard, admin.updateUserRole);

module.exports = router;
