import { Router } from 'express';
import { auth } from '@/middlewares/auth.middleware';
import { restrictTo } from '@/middlewares/role.middleware';
import { ROLES } from '@/config';
import { updateVariable, getPLCVariables } from '../controllers/robot-control.controller';
import validate from '@/middlewares/validate.middleware';
import { updatePLCVariablesRules } from '@/validators/plc';


const router = Router();
router.get('/plc/variables/robot',  auth, restrictTo(ROLES.ADMIN), getPLCVariables);

router.post('/plc/variables/robot',  auth, restrictTo(ROLES.ADMIN), validate(updatePLCVariablesRules), updateVariable);

export default router; 