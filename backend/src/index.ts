import dotenv from 'dotenv';
import fs from "fs";
import https from "https";
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

const options = {
  key: fs.readFileSync("./cert/cert-key.pem"),
  cert: fs.readFileSync("./cert/cert.pem"),
};

https.createServer(options, app).listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// }); 