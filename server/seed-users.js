import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Organizer from './models/Organizer.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Create a mock user
    let user1 = await User.findOne({ email: 'alex@example.com' });
    if (!user1) {
      user1 = await User.create({
        name: 'Alex Johnson',
        username: 'alex_j',
        email: 'alex@example.com',
        password: 'password123',
        phone: '+1 (555) 019-2834',
        role: 'trekker',
        is_verified: true,
        status: 'active',
        profileImage: 'https://api.dicebear.com/7.x/adventurer/svg?seed=alex',
        bio: 'Outdoor enthusiast, weekend trekker, and photography lover.',
      });
      console.log('Created User: Alex Johnson');
    }

    // Create a mock organizer user
    let user2 = await User.findOne({ email: 'info@summitadventures.com' });
    if (!user2) {
      user2 = await User.create({
        name: 'Summit Adventures LLC',
        username: 'summit_adv',
        email: 'info@summitadventures.com',
        password: 'password123',
        phone: '+1 (555) 011-8899',
        role: 'organizer',
        is_verified: true,
        status: 'active',
        profileImage: 'https://api.dicebear.com/7.x/bottts/svg?seed=summit',
        bio: 'Professional trekking outfit offering guided alpine climbs.',
      });
      console.log('Created Organizer User: Summit Adventures LLC');

      // Create Organizer profile
      await Organizer.create({
        user_id: user2._id,
        organization_name: 'Summit Adventures LLC',
        license_number: 'LIC-SUMMIT-2025-9981',
        experience: 8,
        status: 'approved',
        phone: '+1 (555) 011-8899',
        description: 'Alpine specialized mountaineering organizers.',
      });
      console.log('Created Organizer Profile: Summit Adventures LLC');
    }

    console.log('Database Seeding Completed');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
