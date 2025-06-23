import { Request, Response, NextFunction } from 'express';
import { ProductService } from '@/services/product.service';
import { UserActivityService } from '@/services/user-activity.service';
import { returnMessage, returnError, returnPaginationMessage } from '@/controllers/base.controller';
import { ActivityAction, ActivityResource } from '@/models/user-activity.model';
import mongoose from 'mongoose';
import { getList, getDetail, getSettingDetail } from '@/transforms/product.transform';
import { validationResult } from 'express-validator';

import exceljs from 'exceljs';

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
    const { code, name, sizeDm2, image } = req.body;
    const payload = { code : code?.toUpperCase(), name, sizeDm2, image }
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
    const data = await productService.getProducts(query);
    const result = getList(data);
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

    return res.status(200).json(returnMessage(getDetail(product), 'Product retrieved successfully'));
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
    const { code, name, sizeDm2, image } = req.body;
    
    const payload = { code : code?.toUpperCase(), name, sizeDm2, image };
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

// Get product changes (activity history)
export const getProductChanges = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = req.params.id;

    const activities = await userActivityService.getResourceActivities(
      ActivityResource.PRODUCT,
      new mongoose.Types.ObjectId(productId),
      { limit: 0 } // Set limit to 0 to disable pagination and load all
    );
    
    return res.status(200).json(returnMessage(activities.docs, 'Product changes retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

// Download products as an Excel file
export const downloadProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await productService.getAllProductsSorted();

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Products');

    // Define columns
    worksheet.columns = [
      { header: '#', key: 'id', width: 5 },
      { header: 'Mã sản phẩm', key: 'code', width: 20 },
      { header: 'Tên sản phẩm', key: 'name', width: 30 },
      { header: 'Kích thước (dm²)', key: 'sizeDm2', width: 20 },
      { header: 'Ngày tạo', key: 'createdAt', width: 20 },
      { header: 'Ngày cập nhật', key: 'updatedAt', width: 20 },
    ];

    // Add rows
    products.forEach((product, index) => {
      worksheet.addRow({
        id: index + 1,
        code: product.code,
        name: product.name,
        sizeDm2: product.sizeDm2,
        createdAt: product.createdAt ? new Date(product.createdAt).toLocaleString() : '',
        updatedAt: product.updatedAt ? new Date(product.updatedAt).toLocaleString() : '',
      });
    });

    // Set response headers for download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'products.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
}; 


// Get a single product settings
export const getProductSetting = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const line = req.query.line || 1;
    const product = await productService.getProductById(req.params.id);
    const productTransform = await getSettingDetail(product, line as number);
    return res.status(200).json(returnMessage(productTransform, 'Product and setting retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateProductSetting = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(returnError(errors.array()[0].msg));
  }

  try {
    const { id } = req.params;
    const { settings } = req.body;
    const product = await productService.updateProductSetting(id, settings);
    res.status(200).json(returnMessage(product, 'Cập nhật cài đặt sản phẩm thành công'));
  } catch (error) {
    next(error);
  }
};