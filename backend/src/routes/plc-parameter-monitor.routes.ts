import { Router } from 'express';
import { auth } from '@/middlewares/auth.middleware';
import { restrictTo } from '@/middlewares/role.middleware';
import { ROLES } from '@/config';
import {  getPLCTemperature, getPLCElectricity } from '../controllers/plc-parameter-monitor.controller';


const router = Router();
router.get('/plc/parameter/temperature',  auth, restrictTo(ROLES.ADMIN), getPLCTemperature);
router.get('/plc/parameter/electricity',  auth, restrictTo(ROLES.ADMIN), getPLCElectricity);


export default router; 