import express from 'express';
import { auth } from '@/middleware/auth.middleware';
import { restrictTo } from '@/middleware/role.middleware';
import { ROLES } from '@/config';
import {
  getActivities,
  getMyActivities,
  getResourceActivities,
} from '@/controllers/user-activity.controller';

const router = express.Router();

// Get all activities (admin only)
router.get('/activities', auth, restrictTo(ROLES.ADMIN), getActivities);

// Get current user's activities
router.get('/my-activities', auth, getMyActivities);

// Get activities for a specific resource
router.get('/activities/:resource/:resourceId', auth, getResourceActivities);

export default router; 