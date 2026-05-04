const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const connectDB = require('./config/db');
const seedDatabase = require('./services/seedData');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST'] }
});

// Connect DB
connectDB().then(() => seedDatabase());

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan('dev'));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Sanitize data (Prevents NoSQL Injection)
app.use(mongoSanitize());

// Prevent XSS attacks (Cross-site scripting)
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Rate limiter — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/auth', limiter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Attach io to requests
app.use((req, res, next) => { req.io = io; next(); });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/vendor', require('./routes/vendor'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/counters', require('./routes/counter'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api', require('./routes/review'));
app.use('/api', require('./routes/profile'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api', require('./routes/customer'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Catch 404 Route
app.use((req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Global Error Handler Middleware
app.use(errorHandler);

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('join-shop', (shopId) => {
    socket.join(shopId);
    console.log(`Socket ${socket.id} joined shop ${shopId}`);
  });
  socket.on('leave-shop', (shopId) => socket.leave(shopId));
  // User-specific room for notifications
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`Socket ${socket.id} joined user room user-${userId}`);
  });
  socket.on('leave-user', (userId) => socket.leave(`user-${userId}`));
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
