import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

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

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

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

// Error handler to print the stack trace
app.use((err, req, res, next) => {
  console.error('Stack trace of error:');
  console.error(err.stack);
  res.status(500).json({ error: err.message, stack: err.stack });
});

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully!');
    
    const server = app.listen(0, async () => {
      const port = server.address().port;
      console.log(`Test server listening on port ${port}`);
      
      try {
        console.log('Fetching /api/treks...');
        const res = await fetch(`http://localhost:${port}/api/treks`);
        const data = await res.json();
        console.log('Response data:', data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        server.close();
        mongoose.disconnect();
      }
    });
  } catch (error) {
    console.error('Setup error:', error);
  }
}

run();
