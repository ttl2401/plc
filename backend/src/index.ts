import dotenv from 'dotenv';
import app from './app';
import { connectMongoDB, disconnectMongoDB } from '@/config/mongodb';
import { closeInfluxDB } from '@/config/influxdb';

dotenv.config();

const port = process.env.PORT || 3001;

// Connect to databases
connectMongoDB();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await disconnectMongoDB();
  await closeInfluxDB();
  process.exit(0);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 