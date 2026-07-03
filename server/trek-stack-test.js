import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import trekRoutes from './routes/trekRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/treks', trekRoutes);

// Error handler to print the stack trace
app.use((err, req, res, next) => {
  console.error('Stack trace of error:');
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const server = app.listen(0, async () => {
      const port = server.address().port;
      console.log(`Test server listening on port ${port}`);
      
      try {
        const res = await fetch(`http://localhost:${port}/api/treks/banners`);
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
