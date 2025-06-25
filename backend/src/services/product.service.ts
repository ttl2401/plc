import { Product, IProduct, IProductSetting } from '@/models/product.model';
import { AppError } from '@/middlewares/error.middleware';
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
    const { page = 1, limit = 10, sort = { createdAt: -1 }, select = '', search } = query;

    const options = {
      page: Number(page),
      limit: Number(limit),
      sort,
      select,
      // lean: true, // Return as Javascript Json Object, so that dont need to call toObject for element
    };

    const queryFilters: Record<string, any> = {};
    
    // Handle search query for name or code
    if (search) {
      queryFilters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    // The result from paginate still contains Mongoose Document types for docs
    return await Product.paginate(queryFilters, options);

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

  /**
   * Get all products without pagination, sorted by createdAt ascending
   */
  async getAllProductsSorted(): Promise<IProduct[]> {
    const products = await Product.find().sort({ createdAt: 1 }).lean();
    return products;
  }

  async updateProductSetting(id: string, newSetting: IProductSetting): Promise<IProduct> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid product ID', 400);
    }
    const product = await Product.findById(id);
    if (!product) {
      throw new AppError('No product found with that ID', 404);
    }
    // Find the index of the setting for the given line
    const settings = product.settings || [];
    const settingIndex = settings.findIndex(s => s.line === newSetting.line);
    if (settingIndex > -1) {
      // If found, update the setting
      product.settings[settingIndex] = newSetting;
    } else {
      // If not found, add the new setting to the array
      product.settings = [newSetting];
    }
    await product.save();
    return product;
  }

  /**
   * Get all products that have a non-empty settings array, paginated, with search
   */
  async getProductsWithSettings(query: QueryOptions): Promise<PaginateResult<IProduct>> {
    const { page = 1, limit = 10, sort = { createdAt: -1 }, select = '', search, mode, line = 1 } = query;

    const options = {
      page: Number(page),
      limit: Number(limit),
      sort,
      select,
    };

    // Filter by line and mode in settings array if provided
    const elemMatch: any = {};
    if(mode){
      elemMatch.mode = mode;
    }
    if(line){
      elemMatch.line = Number(line);
    }
    const queryFilters: Record<string, any> = {
      settings: {
        $exists: true, $ne: [],
        $elemMatch: elemMatch
      }
    };

    if (search) {
      queryFilters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    return await Product.paginate(queryFilters, options);
  }
} 