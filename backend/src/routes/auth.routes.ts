import express from 'express';
import { login, logout } from '@/controllers/auth.controller';

const router = express.Router();

// Auth routes
router.post('/auth/login', login);
router.post('/auth/logout', logout);

export default router;
