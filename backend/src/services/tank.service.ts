import { Tank, ITank } from '@/models/tank.model';
import { AppError } from '@/middlewares/error.middleware';
import { PaginateResult } from '@/controllers/base.controller';
import mongoose from 'mongoose';

interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  select?: string;
  populate?: boolean;
  [key: string]: any;
}

export class TankService {
  /**
   * Create a new tank
   */
  async createTank(tankData: Partial<ITank>): Promise<ITank> {
    try {
      const tank = await Tank.create(tankData);
      return tank;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError('Tank with this key already exists', 400);
      }
      throw error;
    }
  }

  /**
   * Get all tanks with pagination and filtering
   */
  async getTanks(query: QueryOptions): Promise<PaginateResult<ITank>> {
    const { 
      page = 1, 
      limit = 10, 
      sort = { createdAt: -1 }, 
      select = '', 
      populate = true,
      search,
      groupKey 
    } = query;

    const options = {
      page: Number(page),
      limit: Number(limit),
      sort,
      select,
      populate: populate ? 'group' : undefined,
    };

    const queryFilters: Record<string, any> = {};
    
    // Handle search query for name
    if (search) {
      queryFilters.name = { $regex: search, $options: 'i' };
    }

    // Filter by groupKey if provided
    if (groupKey) {
      queryFilters.groupKey = groupKey;
    }

    return await Tank.paginate(queryFilters, options);
  }

  /**
   * Get a single tank by ID
   */
  async getTankById(id: string, populate = true): Promise<ITank> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid tank ID', 400);
    }
    const query = Tank.findById(id);
    if (populate) {
      query.populate('group');
    }
    const tank = await query;
    if (!tank) {
      throw new AppError('No tank found with that ID', 404);
    }
    return tank;
  }

  /**
   * Get a single tank by key
   */
  async getTankByKey(key: string, populate = true): Promise<ITank> {
    const query = Tank.findOne({ key });
    if (populate) {
      query.populate('group');
    }
    const tank = await query;
    if (!tank) {
      throw new AppError('No tank found with that key', 404);
    }
    return tank;
  }

  /**
   * Update a tank
   */
  async updateTank(id: string, tankData: Partial<ITank>): Promise<ITank> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid tank ID', 400);
    }
    try {
      const tank = await Tank.findByIdAndUpdate(
        id,
        tankData,
        {
          new: true,
          runValidators: true,
        }
      ).populate('group');

      if (!tank) {
        throw new AppError('No tank found with that ID', 404);
      }

      return tank;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError('Tank with this key already exists', 400);
      }
      throw error;
    }
  }

  /**
   * Delete a tank
   */
  async deleteTank(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid tank ID', 400);
    }
    const tank = await Tank.findByIdAndDelete(id);
    if (!tank) {
      throw new AppError('No tank found with that ID', 404);
    }
  }

  /**
   * Get all active tanks by group
   */
  async getActiveTanksByGroup(groupKey: string): Promise<ITank[]> {
    return await Tank.find({ 
      groupKey,
      active: true 
    })
    .populate('group')
    .sort({ name: 1 });
  }

  /**
   * Get all active tanks
   */
  async getAllActiveTanks(): Promise<ITank[]> {
    return await Tank.find({ active: true })
      .populate('group')
      .sort({ name: 1 });
  }
} 