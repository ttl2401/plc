import dotenv from 'dotenv';
import fs from "fs";
import https from "https";
import app from './app';
import { connectMongoDB, disconnectMongoDB } from '@/config/mongodb';
import { closeInfluxDB, checkInfluxDB } from '@/config/influxdb';
import { checkPlcConnection } from '@/config/plc';
import { PORT } from '@/config';

dotenv.config();

// Connect to databases
connectMongoDB();
checkInfluxDB();
checkPlcConnection();
// Handle graceful shutdown
process.on('SIGINT', async () => {
  await disconnectMongoDB();
  await closeInfluxDB();
  process.exit(0);
});

if (process.env.NODE_ENV === "development") {
  const options = {
    key: fs.readFileSync("./cert/cert-key.pem"),
    cert: fs.readFileSync("./cert/cert.pem"),
  };

  https.createServer(options, app).listen(PORT, () => {
    console.log(`${process.env.NODE_ENV } Server https is running on port ${PORT}`);
  });
}
else {
  app.listen(PORT, () => {
    console.log(`${process.env.NODE_ENV } Server http is running on port ${PORT}`);
  });
}