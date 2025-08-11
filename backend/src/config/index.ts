import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Server configuration
export const PORT = process.env.PORT || 3001;

// Api Url
export const API_URL = process.env.API_URL || 'http://localhost';

// MongoDB configuration
export const MONGODB = {
  HOST: process.env.MONGODB_HOST || 'localhost',
  PORT: process.env.MONGODB_PORT || '27017',
  USER: process.env.MONGODB_USER || '',
  PASSWORD: process.env.MONGODB_PASSWORD || '',
  DATABASE: process.env.MONGODB_DATABASE || 'plc',
};

// InfluxDB configuration
export const INFLUXDB = {
  URL: process.env.INFLUX_URL || 'http://localhost:8086',
  TOKEN: process.env.INFLUX_TOKEN || '',
  ORG: process.env.INFLUX_ORG || 'xima',
  BUCKET: process.env.INFLUX_BUCKET || 'plc-influx',
};

// JWT configuration
export const JWT = {
  SECRET: process.env.JWT_SECRET || 'your-secret-key',
  EXPIRES_IN: process.env.JWT_EXPIRES_IN as string | number || '1d',
};

// User roles configuration
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
//  ALL: ['admin', 'manager', 'user'] as const,
};
export const ENUM_ROLES = [
  ROLES.ADMIN, ROLES.MANAGER, ROLES.USER
];

// Helper function to get MongoDB URI
export const getMongoURI = () => {
  const { USER, PASSWORD, HOST, PORT, DATABASE } = MONGODB;
  if (USER && PASSWORD) {
    return `mongodb://${USER}:${PASSWORD}@${HOST}:${PORT}/${DATABASE}`;
  }
  return `mongodb://${HOST}:${PORT}/${DATABASE}`;
}; 

export const PLC_CONFIG = {
  HOST: process.env.PLC_HOST || '192.168.1.100',
  RACK: process.env.PLC_RACK || 0,
  SLOT: process.env.PLC_SLOT || 1,
  DB_NUMBER_ROBOT: process.env.PLC_DB_NUMBER_ROBOT || 65,
  DB_NUMBER_CONTROL: process.env.PLC_DB_NUMBER_CONTROL || 66,
};