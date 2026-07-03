import mongoose from 'mongoose';
import Trek from './models/Trek.js';
import User from './models/User.js';
import Booking from './models/Booking.js';

async function run() {
  try {
    await mongoose.connect('mongodb+srv://trekmate:trekmate123@cluster0.ltgjuni.mongodb.net/Trekmate?retryWrites=true&w=majority&appName=Cluster0');
    
    const trek = await Trek.findOne({ id: 'diya-497' });
    const user = await User.findOne({ email: 'ashi@gmail.com' });
    
    console.log('Trek:', trek ? trek.id : null);
    console.log('User:', user ? user.email : null);
    
    let isAuthorized = false;
    
    if (user.role === 'admin') {
      console.log('Admin check passed');
      isAuthorized = true;
    } else if (user.role === 'organizer' && (String(trek.organizer_id) === String(user._id) || (trek.organizer && trek.organizer.toLowerCase() === user.name.toLowerCase()))) {
      console.log('Organizer check passed');
      isAuthorized = true;
    } else {
      console.log('Checking standard user bookings...');
      const booking = await Booking.findOne({ 
        $and: [
          { $or: [{ user_id: user._id }, { user: user._id }] },
          { $or: [{ trip_id: trek._id }, { trekId: trek.id }] },
          { $or: [{ booking_status: 'confirmed' }, { status: 'Approved' }, { status: 'Confirmed' }] }
        ]
      });
      if (booking) {
        console.log('Booking found! Authorized.');
        isAuthorized = true;
      } else {
        console.log('No booking found.');
      }
    }
    
    console.log('isAuthorized:', isAuthorized);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}
run();
