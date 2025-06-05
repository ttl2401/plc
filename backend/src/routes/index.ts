
import express from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import userActivitiesRoutes from './user-activity.routes';
const router = express.Router();

router.use(userRoutes);
router.use(authRoutes);
router.use(userActivitiesRoutes);

export default router; 