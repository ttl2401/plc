import express from 'express';
import { auth } from '@/middlewares/auth.middleware';
import { restrictTo } from '@/middlewares/role.middleware';
import { ROLES } from '@/config';
import {
    getInformationPlating
} from '@/controllers/information.controller';


const router = express.Router();

// settings timer
router.route('/information/plating')
.get(auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.USER), getInformationPlating);


export default router; 