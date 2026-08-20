require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const assetRoutes = require('./src/routes/assetRoutes');
const liabilityRoutes = require('./src/routes/liabilityRoutes');
const { router: instrumentRoutes } = require('./src/routes/instrumentRoutes');
const { initPriceScheduler } = require('./src/services/schedulerService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/liabilities', liabilityRoutes);
app.use('/api/instruments', instrumentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const startServer = async () => {
  const connected = await connectDB();
  if (connected) {
    initPriceScheduler();
  }
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();

module.exports = app;