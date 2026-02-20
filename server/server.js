
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const recordRoutes = require('./routes/records');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---

// Robust CORS configuration to handle frontend requests from any origin during dev
app.use(cors({
  origin: true, // Allow any origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization']
}));

app.use(express.json());

// --- Database Connection ---
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI is missing in .env file');
      return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast if no connection
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    // Do not exit process so that the API can still respond with errors instead of crashing
  }
};
connectDB();

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);

// --- Health Check ---
app.get('/', (req, res) => {
  res.json({ 
    status: 'API Running', 
    timestamp: new Date(),
    dbState: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    env: process.env.NODE_ENV || 'development'
  });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(500).json({ msg: 'Internal Server Error' });
});

// --- Server Startup ---
app.listen(PORT, '0.0.0.0', () => { // Listen on all interfaces
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`👉 Health check: http://localhost:${PORT}/`);
  console.log(`👉 Auth API: http://localhost:${PORT}/api/auth`);
});
