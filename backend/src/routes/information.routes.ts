import express from 'express';
import { auth } from '@/middlewares/auth.middleware';
import { restrictTo } from '@/middlewares/role.middleware';
import { ROLES } from '@/config';
import {
    getInformationPlating,
    downloadInformationPlating
} from '@/controllers/information.controller';


const router = express.Router();

// settings timer
router.route('/information/plating')
.get(auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.USER), getInformationPlating);

// Route for downloading plating information as Excel (accessible by Admin and Manager)
router.get('/information/plating/download', auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.USER), downloadInformationPlating);

export default router; 