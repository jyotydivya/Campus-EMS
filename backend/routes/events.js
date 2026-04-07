const express = require('express');
const router = express.Router();
const {
  getEvents, getEvent, createEvent, updateEvent, deleteEvent, getMyEvents, getParticipants,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getEvents);
router.get('/organizer/mine', protect, authorize('organizer', 'admin'), getMyEvents);
router.get('/:id', getEvent);
router.get('/:id/participants', protect, authorize('organizer', 'admin'), getParticipants);
router.post('/', protect, authorize('organizer', 'admin'), createEvent);
router.put('/:id', protect, authorize('organizer', 'admin'), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);

module.exports = router;
