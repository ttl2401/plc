import express from 'express';
import { auth } from '@/middlewares/auth.middleware';
import { restrictTo } from '@/middlewares/role.middleware';
import { ROLES } from '@/config';
import {
    getInformationPlating,
    downloadInformationPlating,
    getInformationTemperature,
    downloadInformationTemperature,
    getInformationTimer,
    downloadInformationTimer,
    getInformationTimerDetail,
    getInformationTimerMongo
} from '@/controllers/information.controller';


const router = express.Router();

// plating information 
router.route('/information/plating')
.get(auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.USER), getInformationPlating);
// Route for downloading plating information as Excel 
router.get('/information/plating/download', auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.USER), downloadInformationPlating);

// temperature information 
router.route('/information/temperature')
.get(auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.USER), getInformationTemperature);
// Route for downloading temperature information as Excel 
router.get('/information/temperature/download', auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.USER), downloadInformationTemperature);


// timer information 
router.route('/information/timer')
.get(auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.USER), getInformationTimerMongo);
// Route for downloading temperature information as Excel 
router.get('/information/timer/download', auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.USER), downloadInformationTimer);
// timer information detail for each code
router.get('/information/timer/:code', auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.USER), getInformationTimerDetail);

export default router; 