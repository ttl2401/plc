import express from 'express';
import { auth } from '@/middleware/auth.middleware';
import {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getProfile,
} from '@/controllers/user.controller';

const router = express.Router();

// Protected profile route
router.get('/profile', auth, getProfile);

// User CRUD routes
router.route('/users')
  .get(getUsers)
  .post(createUser);

router.route('/users/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

export default router; 