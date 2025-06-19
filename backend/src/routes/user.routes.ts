import express from 'express';
import { auth } from '@/middlewares/auth.middleware';
import { restrictTo } from '@/middlewares/role.middleware';
import { ROLES } from '@/config';
import {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getProfile,
} from '@/controllers/user.controller';

const router = express.Router();

// Protected profile route - accessible by all authenticated users
router.get('/profile', auth, getProfile);

// User CRUD routes with role restrictions
router.route('/users')
  .get(auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER), getUsers)  // Only admin and manager can list users
  .post(auth, restrictTo(ROLES.ADMIN), createUser);  // Only admin can create users

router.route('/users/:id')
  .get(auth, restrictTo(ROLES.ADMIN, ROLES.MANAGER), getUser)  // Only admin and manager can view user details
  .patch(auth, restrictTo(ROLES.ADMIN), updateUser)  // Only admin can update users
  .delete(auth, restrictTo(ROLES.ADMIN), deleteUser);  // Only admin can delete users

export default router; 