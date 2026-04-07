const express = require('express');
const router = express.Router();
const { getMyTickets, scanTicket } = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/my', protect, authorize('student'), getMyTickets);
router.post('/scan', protect, authorize('organizer', 'admin'), scanTicket);

module.exports = router;
