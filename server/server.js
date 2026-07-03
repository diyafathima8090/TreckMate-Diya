import express from 'express';
// fr-bck comuntcte
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer } from 'http';
import net from 'net';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import trekRoutes from './routes/trekRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import organizerRoutes from './routes/organizerRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import sosRoutes from './routes/sosRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import Message from './models/Message.js';
import SosAlert from './models/SosAlert.js';

// Load env variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const httpServer = createServer(app);
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  process.env.ADMIN_URL || 'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3005',
];

// sockect io 
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  }
});

import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Trek from './models/Trek.js';
import Booking from './models/Booking.js';
import ChatRoom from './models/ChatRoom.js';
import Participant from './models/Participant.js';

// --- SOCKET.IO LOGIC ---
// Middleware for Socket.IO Auth usersndjwt-verfyservr-findusrdtbse-allowcnnctin
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`Socket Connected: ${socket.id} (User: ${socket.user.name}, Role: ${socket.user.role})`);

  // Organizers join their specific master room
  if (socket.user.role === 'organizer' || socket.user.role === 'admin') {
    socket.join(`organizer_${socket.user._id}`);
    console.log(`Socket ${socket.id} joined organizer_${socket.user._id}`);
  }

  // Join specific trek rooms
  socket.on('join_trek', async (trekId) => {
    try {
      let isAuthorized = false;
      const trek = await Trek.findOne({ id: trekId });
      
      if (!trek) return;

      if (socket.user.role === 'admin') {
        isAuthorized = true;
      } else if (socket.user.role === 'organizer' && trek.organizer.toLowerCase() === socket.user.name.toLowerCase()) {
        isAuthorized = true;
      } else {
        // Trekker must have a confirmed booking
        const booking = await Booking.findOne({ 
          user: socket.user._id, 
          trip_id: trek._id, 
          booking_status: 'confirmed' 
        });
        const legacyBooking = await Booking.findOne({ 
          user: socket.user._id, 
          trekId: trekId, 
          booking_status: 'confirmed' 
        });
        
        if (booking || legacyBooking) {
          isAuthorized = true;
        }
      }

      if (isAuthorized) {
        socket.join(`trek_${trekId}`);
        console.log(`Socket ${socket.id} joined trek_${trekId}`);
      } else {
        console.log(`Socket ${socket.id} denied access to trek_${trekId}`);
      }
    } catch (error) {
      console.error('Error joining trek room:', error);
    }
  });

  // Relay telemetry to trek room (both participants and organizer are in trek_${trekId} if they joined)
  // Also send directly to organizer's personal room just in case
  socket.on('send_telemetry', async (data) => {
    const { trekId } = data;
    io.to(`trek_${trekId}`).emit('receive_telemetry', data);
    
    // Find organizer and emit to their room
    const trek = await Trek.findOne({ id: trekId });
    if (trek && trek.organizer_id) {
      io.to(`organizer_${trek.organizer_id}`).emit('receive_telemetry', data);
    }

    try {
      // Import dynamic so it avoids hoisting issues if not at top level
      const { default: LiveLocation } = await import('./models/LiveLocation.js');
      await LiveLocation.create({
        trekId: trekId,
        user_id: socket.user ? socket.user._id : null,
        lat: data.lat,
        lng: data.lng,
        elevation: data.elevation,
        speed: data.speed,
        timestamp: new Date()
      });
    } catch (err) {
      console.error('Error saving live location:', err);
    }
  });

  // Relay SOS alerts
  socket.on('trigger_sos', async (data) => {
    try {
      const trek = await Trek.findOne({ id: data.trekId });
      if (!trek) return;

      // Save SOS alert to database
      await SosAlert.create({
        user_id: socket.user._id,
        trip_id: trek._id,
        organizer_id: trek.organizer_id,
        trekId: data.trekId,
        trekName: data.trekName,
        lat: data.lat,
        lng: data.lng,
        time: data.time || new Date(),
        status: 'active'
      });
      
      // Emit to organizer's specific room
      if (trek.organizer_id) {
        io.to(`organizer_${trek.organizer_id}`).emit('sos_alert', data);
      }
    } catch (error) {
      console.error('Error saving SOS alert:', error);
    }
  });
  
  // Chat messaging
  socket.on('send_chat', async (data) => {
    try {
      // Find Trek ObjectId
      const trek = await Trek.findOne({ id: data.trekId });
      if (!trek) return;

      // Save message to database
      const newMessage = await Message.create({
        trip_id: trek._id,
        sender_id: socket.user._id,
        trekId: data.trekId,
        senderName: data.sender || socket.user.name,
        senderRole: socket.user.role === 'organizer' ? 'organizer' : 'hiker',
        text: data.text,
        message: data.text // the new schema field
      });

      // Attach DB ID to the broadcasted data so frontend gets a unique key
      data.id = newMessage._id;
      data.sender = socket.user.name; // enforce real name
      data.role = socket.user.role === 'organizer' ? 'Guide' : 'Trekker'; // UI expected formatting
      
      // Emit only to the specific trek room
      io.to(`trek_${data.trekId}`).emit('chat_message', data);
      
      // Ensure organizer gets it too
      if (trek.organizer_id) {
        io.to(`organizer_${trek.organizer_id}`).emit('chat_message', data);
      }
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  });

  // --- NEW CHAT SYSTEM EVENTS ---
  socket.on('join_room', async ({ roomId }) => {
    try {
      if (!roomId) return;
      const participant = await Participant.findOne({ room_id: roomId, user_id: socket.user._id });
      if (participant || socket.user.role === 'admin') {
        socket.join(`room_${roomId}`);
        console.log(`Socket ${socket.id} joined room_${roomId}`);
      } else {
        console.log(`Socket ${socket.id} denied access to room_${roomId}`);
      }
    } catch (error) {
      console.error('Error joining room:', error);
    }
  });

  socket.on('send_message', async (data) => {
    try {
      const { roomId, message, type, media_url } = data;
      const participant = await Participant.findOne({ room_id: roomId, user_id: socket.user._id });
      
      if (!participant && socket.user.role !== 'admin') return;

      const newMessage = await Message.create({
        room_id: roomId,
        sender_id: socket.user._id,
        message,
        message_type: type || 'text',
        media_url: media_url || ''
      });

      const populatedMessage = await Message.findById(newMessage._id).populate('sender_id', 'name profileImage role');
      
      io.to(`room_${roomId}`).emit('new_message', populatedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('typing', ({ roomId, isTyping }) => {
    socket.to(`room_${roomId}`).emit('user_typing', { userId: socket.user._id, name: socket.user.name, isTyping });
  });

  socket.on('read_receipt', async ({ roomId, messageId }) => {
    try {
      await Participant.findOneAndUpdate(
        { room_id: roomId, user_id: socket.user._id },
        { last_read_message_id: messageId }
      );
      io.to(`room_${roomId}`).emit('message_read', { roomId, userId: socket.user._id, messageId });
    } catch (error) {
      console.error('Error updating read receipt:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket Disconnected: ${socket.id}`);
  });
});
// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Base Route
app.get('/', (req, res) => {
  res.send('TrekMate API Running ✅');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/treks', trekRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/organizer', organizerRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/chat', chatRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`Global Error: ${err.message}`);
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

// Resilient server start — handles EADDRINUSE caused by OneDrive sync / nodemon restarts
const startServer = (port) => {
  httpServer.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
  });

  httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠ Port ${port} is already in use. Trying port ${port + 1}...`);
      httpServer.close();
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
};

startServer(PORT);