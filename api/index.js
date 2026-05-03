require('dotenv').config();
const express = require('express');

// We simply require the config file so it runs the Firebase initialization.
// We don't need to assign it to 'pool' anymore.
require('./config/db.config'); 

const authRoutes = require('./api/routes/auth.routes');
const tradeRoutes = require('./api/routes/trades.routes');
const dashboardRoutes = require('./api/routes/dashboard.routes');
const noteRoutes = require('./api/routes/notes.routes');
const aiRoutes = require('./api/routes/ai.routes');
const goalRoutes = require('./api/routes/goals.routes');
// Add this to your imports at the top
const adminRoutes = require('./api/routes/admin.routes');
const brokerRoutes = require('./api/routes/broker.routes');

// Add this to your API ROUTES section


const app = express();

// --- MIDDLEWARES ---

// Manual CORS Handling Middleware
app.use((req, res, next) => {
  // Allow requests from our frontend development server
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  // Allow these HTTP methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  // Allow these headers in the request
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Middleware for parsing JSON bodies
app.use(express.json());


// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/broker', brokerRoutes);

app.get('/', (req, res) => {
  res.json({ message: "Welcome to the TrackInTrade API powered by Firebase! 🚀" });
});

// ADD THIS INSTEAD:
module.exports = app;