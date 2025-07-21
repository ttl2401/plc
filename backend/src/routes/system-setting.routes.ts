import express from 'express';
import { auth } from '@/middlewares/auth.middleware';
import { restrictTo } from '@/middlewares/role.middleware';
import { ROLES } from '@/config';
import {
  getSystemSettingByKey,
  createOrUpdateSystemSettingByKey
} from '@/controllers/system-setting.controller';

const router = express.Router();

// Get setting by key
router.get('/system-settings/:key', auth, restrictTo(ROLES.ADMIN), getSystemSettingByKey);

// create or update setting by key
router.post('/system-settings', auth, restrictTo(ROLES.ADMIN), createOrUpdateSystemSettingByKey );


export default router; 