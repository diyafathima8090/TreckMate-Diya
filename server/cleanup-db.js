import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const cleanDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    const db = mongoose.connection.db;
    
    const collections = await db.listCollections().toArray();
    const names = collections.map(c => c.name);

    if (names.includes('organizer')) {
      await db.dropCollection('organizer');
      console.log('Dropped collection: organizer');
    }
    if (names.includes('payment')) {
      await db.dropCollection('payment');
      console.log('Dropped collection: payment');
    }
    console.log('Cleanup complete');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

cleanDb();
