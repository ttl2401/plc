import express from 'express';
import { uploadFile } from '@/controllers/upload.controller';

const router = express.Router();

// Define the upload route
router.post('/upload', uploadFile);

export default router; 