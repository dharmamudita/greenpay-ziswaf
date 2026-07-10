const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inject Socket.io to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const ziswafRoutes = require('./routes/ziswafRoutes');
const wasteRoutes = require('./routes/wasteRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const greenPointRoutes = require('./routes/greenPointRoutes');
const impactRoutes = require('./routes/impactRoutes');
const aiRoutes = require('./routes/aiRoutes');
const districtRoutes = require('./routes/districtRoutes');
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ziswaf', ziswafRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/green-points', greenPointRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/distrik', districtRoutes);
app.use('/api/admin', adminRoutes);
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GreenPay ZISWAF API is running 🌿' });
});

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  
  // Example: Client joins their own user room
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🌿 GreenPay ZISWAF API & Socket.io running on port ${PORT}`);
});
