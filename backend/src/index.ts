import dotenv from 'dotenv';
import app from './app';
import { connectMongoDB, disconnectMongoDB } from '@/config/mongodb';
import { closeInfluxDB, checkInfluxDB } from '@/config/influxdb';
import { PORT } from '@/config';

dotenv.config();

// Connect to databases
connectMongoDB();
checkInfluxDB();
// Handle graceful shutdown
process.on('SIGINT', async () => {
  await disconnectMongoDB();
  await closeInfluxDB();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 