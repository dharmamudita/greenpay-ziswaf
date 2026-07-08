const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const ziswafRoutes = require('./routes/ziswafRoutes');
const wasteRoutes = require('./routes/wasteRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const greenPointRoutes = require('./routes/greenPointRoutes');
const impactRoutes = require('./routes/impactRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ziswaf', ziswafRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/green-points', greenPointRoutes);
app.use('/api/impact', impactRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GreenPay ZISWAF API is running 🌿' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌿 GreenPay ZISWAF API running on port ${PORT}`);
});
