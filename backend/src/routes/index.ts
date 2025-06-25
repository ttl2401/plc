import express from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import userActivitiesRoutes from './user-activity.routes';
import uploadRoutes from './upload.routes';
import productRoutes from './product.routes';
import settingRoutes from './setting.routes';
import informationRoutes from './information.routes';

const router = express.Router();

router.use(userRoutes);
router.use(authRoutes);
router.use(userActivitiesRoutes);
router.use(uploadRoutes);
router.use(productRoutes);
router.use(settingRoutes);
router.use(informationRoutes);

export default router; 