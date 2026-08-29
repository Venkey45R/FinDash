require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const assetRoutes = require('./src/routes/assetRoutes');
const liabilityRoutes = require('./src/routes/liabilityRoutes');
const { router: instrumentRoutes } = require('./src/routes/instrumentRoutes');
const budgetRoutes = require('./src/routes/budgetRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const authRoutes = require('./src/routes/authRoutes');
const { initPriceScheduler } = require('./src/services/schedulerService');
const authMiddleware = require('./src/middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Protected Routes
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/assets', authMiddleware, assetRoutes);
app.use('/api/liabilities', authMiddleware, liabilityRoutes);
app.use('/api/instruments', authMiddleware, instrumentRoutes);
app.use('/api/budgets', authMiddleware, budgetRoutes);
app.use('/api/transactions', authMiddleware, transactionRoutes);

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