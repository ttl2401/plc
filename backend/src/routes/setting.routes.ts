import express from 'express';
import { auth } from '@/middlewares/auth.middleware';
import { restrictTo } from '@/middlewares/role.middleware';
import { ROLES } from '@/config';
import {
    getSettingTimer,
    updateSettingTimer,
    getSettingTemperature,
    updateSettingTemperature
} from '@/controllers/setting.controller';

import validate from '@/middlewares/validate.middleware';
import { updateSettingTimerRules, updateSettingTemperatureRules } from '@/validators/settings';

const router = express.Router();

// settings timer
router.route('/settings/timer')
.get(auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER), getSettingTimer)
.patch(
    validate(updateSettingTimerRules),
    auth,
    restrictTo(ROLES.ADMIN, ROLES.MANAGER),
  
  updateSettingTimer
);

// settings temperature
router.route('/settings/temperature')
.get(auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER), getSettingTemperature)
.patch(
    validate(updateSettingTemperatureRules),
    auth,
    restrictTo(ROLES.ADMIN, ROLES.MANAGER),
  
  updateSettingTemperature
);


export default router; 