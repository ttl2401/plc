import express from 'express';
import { auth } from '@/middlewares/auth.middleware';
import { ROLES } from '@/config';
import { restrictTo } from '@/middlewares/role.middleware';

import {
    getHistoryOperating,
    downloadHistoryOperating,
    getHistoryChemicalAddition,
    downloadHistoryChemicalAddition

} from '@/controllers/history.controller';


const router = express.Router();
// history operating 
router.route('/history/operating')
.get(auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.USER), getHistoryOperating);
// Route for downloading history operating as Excel 
router.get('/history/operating/download', auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.USER), downloadHistoryOperating);


// history chemical addition 
router.route('/history/chemical-addition')
.get(auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.USER), getHistoryChemicalAddition);
// Route for downloading history operating as Excel 
router.get('/history/chemical-addition/download', auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.USER), downloadHistoryChemicalAddition);



export default router; 