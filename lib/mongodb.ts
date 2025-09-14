import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-saas';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

async function connectDB() {
  if (mongoose.connections[0].readyState) {
    return mongoose;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    return mongoose;
  } catch (error) {
    throw error;
  }
}

export default connectDB;