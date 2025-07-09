import express from 'express';
import { readInflux, writeInflux } from '@/controllers/test.controller';

const router = express.Router();

// Auth routes
router.get('/test/influx', readInflux);
router.post('/test/influx', writeInflux);

export default router;
