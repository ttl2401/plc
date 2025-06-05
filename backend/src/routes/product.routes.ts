import express from 'express';
import { auth } from '@/middleware/auth.middleware';
import { restrictTo } from '@/middleware/role.middleware';
import { ROLES } from '@/config';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from '@/controllers/product.controller';

const router = express.Router();

// Protect all product routes
router.use(auth);

// Routes accessible by Admin and Manager
router.route('/products')
  .get(restrictTo(ROLES.ADMIN, ROLES.MANAGER), getProducts) // Get all products
  .post(restrictTo(ROLES.ADMIN, ROLES.MANAGER), createProduct); // Create a new product

// Routes accessible by Admin and Manager
router.route('/products/:id')
  .get(restrictTo(ROLES.ADMIN, ROLES.MANAGER), getProduct) // Get a single product
  .patch(restrictTo(ROLES.ADMIN), updateProduct) // Update a product (only Admin)
  .delete(restrictTo(ROLES.ADMIN), deleteProduct); // Delete a product (only Admin)

export default router; 