import express from 'express';
import { auth } from '@/middlewares/auth.middleware';
import { restrictTo } from '@/middlewares/role.middleware';
import { ROLES } from '@/config';
import { uploadFile } from '@/controllers/upload.controller';

const router = express.Router();

// Define the upload route
router.post('/upload', auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER), uploadFile);

export default router; 