
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // Mobile is optional for Google users, but unique if provided
  mobile: { type: String, unique: true, sparse: true },
  // Email is optional for Mobile users, but unique if provided
  email: { type: String, unique: true, sparse: true, default: undefined },
  password: { type: String, required: true },
  role: { type: String, default: 'OWNER' },
  business: {
    businessName: String,
    businessType: String,
    city: String,
    state: String,
    gst: String
  },
  preferences: {
    whatsappAlerts: { type: Boolean, default: true },
    emailAlerts: { type: Boolean, default: false },
    dailyReports: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
