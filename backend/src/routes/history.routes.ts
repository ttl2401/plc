import express from 'express';
import { auth } from '@/middlewares/auth.middleware';
import { ROLES } from '@/config';
import { restrictTo } from '@/middlewares/role.middleware';

import {
    getHistoryOperating,
    downloadHistoryOperating,

} from '@/controllers/history.controller';


const router = express.Router();
// history operating 
router.route('/history/operating')
.get(auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.USER), getHistoryOperating);
// Route for downloading history operating as Excel 
router.get('/history/operating/download', auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.USER), downloadHistoryOperating);

export default router; 