const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    venue: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    maxParticipants: { type: Number, required: true },
    currentParticipants: { type: Number, default: 0 },
    bannerImage: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    adminNote: { type: String }, // reason for rejection etc.
    isPaid: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    tags: [{ type: String }],
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Virtual: is event full
eventSchema.virtual('isFull').get(function () {
  return this.currentParticipants >= this.maxParticipants;
});

// Virtual: is registration open
eventSchema.virtual('registrationOpen').get(function () {
  return new Date() < this.registrationDeadline && !this.isFull && this.status === 'approved';
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
