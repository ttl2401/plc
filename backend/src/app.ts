import express from 'express';
import cors from 'cors';
import indexRoutes from '@/routes';
import { errorHandler, notFoundHandler } from '@/middleware/error.middleware';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1', indexRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling
app.all('*', notFoundHandler);
app.use(errorHandler);

export default app; 