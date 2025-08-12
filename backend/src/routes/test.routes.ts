import express from 'express';
import { readInflux, writeInflux, testPLCRead, testPLCWrite, testPLCReadMultiple } from '@/controllers/test.controller';

const router = express.Router();

// Auth routes
router.get('/test/influx', readInflux);
router.post('/test/influx', writeInflux);

// PLC test routes
router.get('/test/plc/read/:variableName', testPLCRead);
router.post('/test/plc/write/:variableName', testPLCWrite);
router.get('/test/plc/read-multiple', testPLCReadMultiple);

export default router;
