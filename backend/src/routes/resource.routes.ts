import { Router } from 'express';
import { getTankGroups } from '../controllers/resource.controller';

const router = Router();

router.get('/tank-groups', getTankGroups);

export default router; 