import express from 'express';
import { auth } from '@/middlewares/auth.middleware';
import { restrictTo } from '@/middlewares/role.middleware';
import { ROLES } from '@/config';
import {
    getSettingTimer,
    updateSettingTimer
} from '@/controllers/setting.controller';

import validate from '@/middlewares/validate.middleware';
import { updateSettingTimerRules } from '@/validators/settings';

const router = express.Router();

// Get all settings timer
router.route('/settings/timer')
.get(auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER), getSettingTimer)
.patch(
    validate(updateSettingTimerRules),
    auth,
    restrictTo(ROLES.ADMIN, ROLES.MANAGER),
  
  updateSettingTimer
);



export default router; 