import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import all 15 models
import Announcement from './models/Announcement.js';
import Banner from './models/Banner.js';
import Booking from './models/Booking.js';
import ChatRoom from './models/ChatRoom.js';
import LiveLocation from './models/LiveLocation.js';
import Message from './models/Message.js';
import Notification from './models/Notification.js';
import Organizer from './models/Organizer.js';
import Participant from './models/Participant.js';
import Payment from './models/Payment.js';
import Report from './models/Report.js';
import SosAlert from './models/SosAlert.js';
import Ticket from './models/Ticket.js';
import Trek from './models/Trek.js';
import User from './models/User.js';

dotenv.config();
mongoose.set('debug', true);

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');
    
    console.log('Querying findOne({ id: "banners" })...');
    const trek = await Trek.findOne({ id: "banners" });
    console.log('Result:', trek);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

run();
