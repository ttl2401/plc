import { Request, Response, NextFunction } from 'express';
import { ProductService } from '@/services/product.service';
import { UserActivityService } from '@/services/user-activity.service';
import { returnMessage, returnError, returnPaginationMessage } from '@/controllers/base.controller';
import { ActivityAction, ActivityResource } from '@/models/user-activity.model';
import mongoose from 'mongoose';

const productService = new ProductService();
const userActivityService = new UserActivityService();

// Create a new product
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Transform code to uppercase
    const { code, name, sizeDm2, image, qrCode } = req.body;
    const payload = { code : code?.toUpperCase(), name, sizeDm2, image, qrCode }
    const product = await productService.createProduct(payload);

    // Log activity
    if (req.user) {
      await userActivityService.logActivity(
        new mongoose.Types.ObjectId(String(req.user._id)),
        ActivityAction.CREATE,
        ActivityResource.PRODUCT,
        new mongoose.Types.ObjectId(String(product._id)),
        { after: product },
        req
      );
    }

    return res.status(201).json(returnMessage(product, 'Product created successfully'));
  } catch (error) {
    next(error);
  }
};

// Get all products
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query;
    const result = await productService.getProducts(query);

    return res.status(200).json(returnPaginationMessage(result, 'Products retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

// Get a single product
export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await productService.getProductById(req.params.id);

    return res.status(200).json(returnMessage(product, 'Product retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

// Update a product
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const { code, name, sizeDm2, image, qrCode } = req.body;
    const payload = { code : code?.toUpperCase(), name, sizeDm2, image, qrCode };
    const beforeProduct = await productService.getProductById(id);
    const product = await productService.updateProduct(id, payload);

    // Log activity
     if (req.user) {
      await userActivityService.logActivity(
        new mongoose.Types.ObjectId(String(req.user._id)),
        ActivityAction.UPDATE,
        ActivityResource.PRODUCT,
        new mongoose.Types.ObjectId(String(product._id)),
        {
          before: beforeProduct,
          after: product,
          changes: req.body, // Log the changes made
        },
        req
      );
    }

    return res.status(200).json(returnMessage(product, 'Product updated successfully'));
  } catch (error) {
    next(error);
  }
};

// Delete a product
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const beforeProduct = await productService.getProductById(req.params.id);
    await productService.deleteProduct(req.params.id);

    // Log activity
     if (req.user) {
      await userActivityService.logActivity(
        new mongoose.Types.ObjectId(String(req.user._id)),
        ActivityAction.DELETE,
        ActivityResource.PRODUCT,
        new mongoose.Types.ObjectId(String(beforeProduct._id)),
        { before: beforeProduct },
        req
      );
    }

    return res.status(204).json(returnMessage(null, 'Product deleted successfully'));
  } catch (error) {
    next(error);
  }
}; 