
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  recordId: { type: String, required: true, index: true },
  type: { type: String, required: true },
  actorId: { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed }, // Flexible payload
  hash: { type: String, required: true }, // Cryptographic link
  timestamp: { type: Number, required: true, default: Date.now }
});

// Index for quick retrieval of record history
EventSchema.index({ recordId: 1, timestamp: 1 });

module.exports = mongoose.model('Event', EventSchema);
