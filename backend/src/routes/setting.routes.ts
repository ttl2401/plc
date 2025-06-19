import express from 'express';
import { auth } from '@/middleware/auth.middleware';
import { restrictTo } from '@/middleware/role.middleware';
import { ROLES } from '@/config';
import {
    getSettingTimer
} from '@/controllers/setting.controller';

const router = express.Router();

// Get all settings timer
router.get('/settings/timer', auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER), getSettingTimer);



export default router; 