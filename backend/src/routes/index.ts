import express from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import userActivitiesRoutes from './user-activity.routes';
import uploadRoutes from './upload.routes';
import productRoutes from './product.routes';
import settingRoutes from './setting.routes';
import informationRoutes from './information.routes';
import testRoutes from './test.routes';
import resourceRoutes from './resource.routes';
import historyRoutes from './history.routes';
import systemSettingRoutes from './system-setting.routes';

const router = express.Router();

router.use(userRoutes);
router.use(authRoutes);
router.use(userActivitiesRoutes);
router.use(uploadRoutes);

router.use(settingRoutes);
router.use(informationRoutes);
router.use(historyRoutes);
router.use(testRoutes);
router.use(productRoutes);
router.use(resourceRoutes);
router.use(systemSettingRoutes);


export default router; 