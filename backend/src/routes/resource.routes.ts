import { Router } from 'express';
import { getTankGroups, getTanks } from '../controllers/resource.controller';

const router = Router();

router.get('/tank-groups', getTankGroups);
router.get('/tanks', getTanks);

export default router; 