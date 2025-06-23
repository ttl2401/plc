import express from 'express';
import { auth } from '@/middlewares/auth.middleware';
import { restrictTo } from '@/middlewares/role.middleware';
import { ROLES } from '@/config';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductChanges,
  downloadProducts,
  getProductSetting,
  updateProductSetting,
  getProductSettingChanges
} from '@/controllers/product.controller';
import { updateSettingPlatingRules } from '@/validators/product';

const router = express.Router();

// Protect all product routes
router.use(auth);

// Routes accessible by Admin and Manager
router.route('/products')
  .get(restrictTo(ROLES.ADMIN, ROLES.MANAGER), getProducts) // Get all products
  .post(restrictTo(ROLES.ADMIN, ROLES.MANAGER), createProduct); // Create a new product

// Route for downloading products as Excel (accessible by Admin and Manager)
router.get('/products/download', restrictTo(ROLES.ADMIN, ROLES.MANAGER), downloadProducts);

// Routes accessible by Admin and Manager
router.get('/products/:id/changes',restrictTo(ROLES.ADMIN, ROLES.MANAGER), getProductChanges); // Get info changelog of prduct

// Routes accessible by Admin and Manager
router.route('/products/:id')
  .get(restrictTo(ROLES.ADMIN, ROLES.MANAGER), getProduct) // Get a single product
  .patch(restrictTo(ROLES.ADMIN), updateProduct) // Update a product (only Admin)
  .delete(restrictTo(ROLES.ADMIN), deleteProduct); // Delete a product (only Admin)

router.route('/products/:id/settings')
  .get(restrictTo(ROLES.ADMIN, ROLES.MANAGER), getProductSetting) // Get a product settings
  .patch(restrictTo(ROLES.ADMIN, ROLES.MANAGER), updateSettingPlatingRules, updateProductSetting);

// Routes Setting changes
router.get('/products/:id/settings/changes',restrictTo(ROLES.ADMIN, ROLES.MANAGER), getProductSettingChanges); // Get info changelog of prduct


export default router; 