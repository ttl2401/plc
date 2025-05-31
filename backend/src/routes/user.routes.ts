import express from 'express';
import { testUser } from '@/controllers/test.controller';
import {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} from '@/controllers/user.controller';

const router = express.Router();

// Test endpoint
router.get('/users/test', testUser);

// User CRUD routes
router.route('/users')
  .get(getUsers)
  .post(createUser);

router.route('/users/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

export default router; 