import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_HOST = process.env.MONGODB_HOST || 'localhost';
const MONGODB_PORT = process.env.MONGODB_PORT || '27017';
const MONGODB_USER = process.env.MONGODB_USER || '';
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD || '';
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'plc';

const getMongoURI = () => {
  if (MONGODB_USER && MONGODB_PASSWORD) {
    return `mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}`;
  }
  return `mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}`;
};

export const connectMongoDB = async () => {
  try {
    const uri = getMongoURI();
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export const disconnectMongoDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
  }
}; 