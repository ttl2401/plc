import { Product, IProduct } from '@/models/product.model';
import { AppError } from '@/middleware/error.middleware';
import { PaginateResult } from '@/controllers/base.controller';
import mongoose from 'mongoose';

interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  select?: string;
  [key: string]: any;
}

export class ProductService {
  /**
   * Create a new product
   */
  async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
    try {
      const product = await Product.create(productData);
      return product;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError('Product with this code already exists', 400);
      }
      throw error;
    }
  }

  /**
   * Get all products with pagination and filtering
   */
  async getProducts(query: QueryOptions): Promise<PaginateResult<IProduct>> {
    const { page = 1, limit = 10, sort = { createdAt: -1 }, select = '', ...filters } = query;

    const options = {
      page: Number(page),
      limit: Number(limit),
      sort,
      select,
      lean: true, // Return plain JavaScript objects
    };

    const queryFilters: Record<string, any> = {};
    Object.entries(filters).forEach(([key, value]) => {
       if (mongoose.Types.ObjectId.isValid(String(value))) {
        queryFilters[key] = new mongoose.Types.ObjectId(String(value));
      } else if (!isNaN(Number(value))) {
        queryFilters[key] = Number(value);
      } else if (typeof value === 'string' && value.length > 0) {
        // Basic text search on name or code
        if (key === 'name' || key === 'code') {
           queryFilters[key] = { $regex: value, $options: 'i' }; // Case-insensitive search
        } else {
           queryFilters[key] = value;
        }
      } else {
         queryFilters[key] = value;
      }
    });

    // Handle potential full-text search query if needed in the future
    // if (query.search) {
    //   queryFilters.$text = { $search: query.search };
    // }

    const result = await Product.paginate(queryFilters, options);

     // Ensure all required pagination fields are present in the result
    return {
      docs: result.docs,
      totalDocs: result.totalDocs,
      limit: result.limit,
      totalPages: result.totalPages,
      page: result.page,
      pagingCounter: result.pagingCounter,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
    };
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<IProduct> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid product ID', 400);
    }
    const product = await Product.findById(id);
    if (!product) {
      throw new AppError('No product found with that ID', 404);
    }
    return product;
  }

  /**
   * Update a product
   */
  async updateProduct(id: string, productData: Partial<IProduct>): Promise<IProduct> {
     if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid product ID', 400);
    }
    try {
      const product = await Product.findByIdAndUpdate(
        id,
        productData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!product) {
        throw new AppError('No product found with that ID', 404);
      }

      return product;
     } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError('Product with this code already exists', 400);
      }
      throw error;
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<void> {
     if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid product ID', 400);
    }
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw new AppError('No product found with that ID', 404);
    }
  }
} 