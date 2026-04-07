const mongoose = require('mongoose');

// ─── Registration ────────────────────────────────────────────────────────────
const registrationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'waitlisted'],
      default: 'confirmed',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'not_required'],
      default: 'not_required',
    },
    paymentReference: { type: String },
  },
  { timestamps: true }
);

// One registration per student per event
registrationSchema.index({ student: 1, event: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);

// ─── Ticket ──────────────────────────────────────────────────────────────────
const ticketSchema = new mongoose.Schema(
  {
    registration: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    ticketId: { type: String, required: true, unique: true }, // UUID
    qrCodeData: { type: String, required: true }, // base64 QR image
    qrPayload: { type: String, required: true }, // JSON string encoded in QR
    scanned: { type: Boolean, default: false },
    scannedAt: { type: Date },
    scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isValid: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = { Registration, Ticket };
