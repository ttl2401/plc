import { Router } from 'express';
import { auth } from '@/middlewares/auth.middleware';
import { restrictTo } from '@/middlewares/role.middleware';
import { ROLES } from '@/config';
import { 
    updateVariableRobot, getPLCVariablesRobot,
    updateVariableChecklist, getPLCVariablesChecklist 
} from '../controllers/plc-robot-control.controller';
import validate from '@/middlewares/validate.middleware';
import { updatePLCVariablesRules } from '@/validators/plc';


const router = Router();
router.get('/plc/variables/robot',  auth, restrictTo(ROLES.ADMIN), getPLCVariablesRobot);

router.post('/plc/variables/robot',  auth, restrictTo(ROLES.ADMIN), validate(updatePLCVariablesRules), updateVariableRobot);


router.get('/plc/variables/checklist',  auth, restrictTo(ROLES.ADMIN), getPLCVariablesChecklist);

router.post('/plc/variables/checklist',  auth, restrictTo(ROLES.ADMIN), validate(updatePLCVariablesRules), updateVariableChecklist);



export default router; 