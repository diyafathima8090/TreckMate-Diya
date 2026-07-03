import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import Trek from './models/Trek.js';
import User from './models/User.js';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, { folder: 'trekmate' });
    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${filePath}:`, error);
    return null;
  }
};

const migrateData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const publicDir = path.resolve('../client/public');
    
    // 1. Migrate Treks
    const treks = await Trek.find({});
    for (const trek of treks) {
      if (trek.image && trek.image.startsWith('/') && !trek.image.startsWith('http')) {
        const localPath = path.join(publicDir, trek.image);
        if (fs.existsSync(localPath)) {
          console.log(`Uploading ${trek.image} for trek ${trek.title}...`);
          const secureUrl = await uploadImage(localPath);
          if (secureUrl) {
            trek.image = secureUrl;
            if (trek.images && trek.images.length > 0) {
                trek.images = trek.images.map(img => img === trek.image ? secureUrl : img);
            }
            if (trek.banner === trek.image || !trek.banner) {
                trek.banner = secureUrl;
            }
            await trek.save();
            console.log(`Successfully updated trek ${trek.title} to ${secureUrl}`);
          }
        }
      }
    }

    // 2. We can also add other models if needed. Let's do Users just in case.
    const users = await User.find({});
    for (const user of users) {
      if (user.profileImage && user.profileImage.startsWith('/') && !user.profileImage.startsWith('http')) {
        const localPath = path.join(publicDir, user.profileImage);
        if (fs.existsSync(localPath)) {
          console.log(`Uploading ${user.profileImage} for user ${user.name}...`);
          const secureUrl = await uploadImage(localPath);
          if (secureUrl) {
            user.profileImage = secureUrl;
            await user.save();
            console.log(`Successfully updated user ${user.name} to ${secureUrl}`);
          }
        }
      }
    }

    console.log('Migration Completed');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

migrateData();
