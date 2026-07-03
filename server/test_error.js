import mongoose from 'mongoose';
import Trek from './models/Trek.js';
import User from './models/User.js';
import Booking from './models/Booking.js';

async function run() {
  try {
    await mongoose.connect('mongodb+srv://trekmate:trekmate123@cluster0.ltgjuni.mongodb.net/Trekmate?retryWrites=true&w=majority&appName=Cluster0');
    
    const trek = await Trek.findOne({ id: 'diya-497' });
    const user = await User.findOne({ email: 'dfathima8090@gmail.com' });
    
    console.log('Trek:', trek ? trek.id : null);
    console.log('User:', user ? user.email : null);
    
    const booking = await Booking.findOne({ 
      $and: [
        { $or: [{ user_id: user._id }, { user: user._id }, { email: user.email }] },
        { $or: [{ trip_id: trek._id }, { trekId: trek.id }] },
        { $or: [{ booking_status: 'confirmed' }, { status: 'Approved' }, { status: 'Confirmed' }, { status: 'Paid & Confirmed' }] }
      ]
    });
    
    if (booking) {
      console.log('Booking found! Authorized by email.');
    } else {
      console.log('No booking found.');
    }
    
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}
run();
