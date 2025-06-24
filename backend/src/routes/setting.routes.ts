import express from 'express';
import { auth } from '@/middlewares/auth.middleware';
import { restrictTo } from '@/middlewares/role.middleware';
import { ROLES } from '@/config';
import {
    getSettingTimer,
    updateSettingTimer,
    getSettingTemperature,
    updateSettingTemperature,
    getSettingRobot,
    updateSettingRobot,
    getSettingChemistry,
    updateSettingChemistry
} from '@/controllers/setting.controller';

import validate from '@/middlewares/validate.middleware';
import { updateSettingTimerRules, updateSettingTemperatureRules, updateSettingRobotRules } from '@/validators/settings';

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


// settings robot
router.route('/settings/robot')
.get(auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER), getSettingRobot)
.patch(
    validate(updateSettingRobotRules),
    auth,
    restrictTo(ROLES.ADMIN, ROLES.MANAGER),
  
  updateSettingRobot
);


// settings chemistry
router.route('/settings/chemistry')
.get(auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER), getSettingChemistry)
.patch(
    validate(updateSettingRobotRules),
    auth,
    restrictTo(ROLES.ADMIN, ROLES.MANAGER),
    updateSettingChemistry
);

export default router; 