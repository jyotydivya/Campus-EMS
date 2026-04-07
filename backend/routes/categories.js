// routes/categories.js
const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', admin.getCategories);
router.post('/', protect, authorize('admin'), admin.createCategory);
router.patch('/:id', protect, authorize('admin'), admin.updateCategory);
router.delete('/:id', protect, authorize('admin'), admin.deleteCategory);

module.exports = router;
