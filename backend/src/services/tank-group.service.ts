import { TankGroup, ITankGroup } from '@/models/tank-group.model';
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

export class TankGroupService {
  /**
   * Create a new tank group
   */
  async createTankGroup(tankGroupData: Partial<ITankGroup>): Promise<ITankGroup> {
    try {
      const tankGroup = await TankGroup.create(tankGroupData);
      return tankGroup;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError('Tank group with this name already exists', 400);
      }
      throw error;
    }
  }

  /**
   * Get all tank groups with pagination and filtering
   */
  async getTankGroups(query: QueryOptions): Promise<PaginateResult<ITankGroup>> {
    const { page = 1, limit = 10, sort = { createdAt: -1 }, select = '', search } = query;

    const options = {
      page: Number(page),
      limit: Number(limit),
      sort,
      select,
    };

    const queryFilters: Record<string, any> = {};
    
    // Handle search query for name
    if (search) {
      queryFilters.name = { $regex: search, $options: 'i' };
    }

    return await TankGroup.paginate(queryFilters, options);
  }

  /**
   * Get a single tank group by ID
   */
  async getTankGroupById(id: string): Promise<ITankGroup> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid tank group ID', 400);
    }
    const tankGroup = await TankGroup.findById(id);
    if (!tankGroup) {
      throw new AppError('No tank group found with that ID', 404);
    }
    return tankGroup;
  }

  /**
   * Update a tank group
   */
  async updateTankGroup(id: string, tankGroupData: Partial<ITankGroup>): Promise<ITankGroup> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid tank group ID', 400);
    }
    try {
      const tankGroup = await TankGroup.findByIdAndUpdate(
        id,
        tankGroupData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!tankGroup) {
        throw new AppError('No tank group found with that ID', 404);
      }

      return tankGroup;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError('Tank group with this name already exists', 400);
      }
      throw error;
    }
  }

  /**
   * Delete a tank group
   */
  async deleteTankGroup(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid tank group ID', 400);
    }
    const tankGroup = await TankGroup.findByIdAndDelete(id);
    if (!tankGroup) {
      throw new AppError('No tank group found with that ID', 404);
    }
  }

  /**
   * Get all active tank groups
   */
  async getActiveTankGroups(): Promise<ITankGroup[]> {
    return await TankGroup.find({ active: true }).sort({ name: 1 });
  }

  /**
   * Get all tank groups where setting.timer exists (can be null or any value)
   */
  async getTankGroupsWithTimerSetting(): Promise<ITankGroup[]> {
    return await TankGroup.find({ 'settings.timer': { $exists: true }, active: true });
  }

  /**
   * Batch update settings.timer for multiple tank groups
   */
  async batchUpdateTimerSettings(list: { tankGroupId: string; timer: number }[]): Promise<ITankGroup[]> {
    const bulkOps = list.map(item => ({
      updateOne: {
        filter: { _id: item.tankGroupId },
        update: { $set: { 'settings.timer': item.timer } }
      }
    }));
    if (bulkOps.length === 0) return [];
    await TankGroup.bulkWrite(bulkOps);
    // Return updated tank groups
    const ids = list.map(item => item.tankGroupId);
    return await TankGroup.find({ _id: { $in: ids } });
  }
} 