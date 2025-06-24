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
      populate = false,
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
  async getTankById(id: string, populate = false): Promise<ITank> {
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
  async getTankByKey(key: string, populate = false): Promise<ITank> {
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


  /**
   * Get all tanks where setting.temp exists (can be null or any value)
   */
  async getTanksWithTempSetting(): Promise<ITank[]> {
    return await Tank.find({ 'settings.temp': { $exists: true }, active: true });
  }

  /**
   * Batch update settings.temp for multiple tanks
   */
  async batchUpdateTempSettings(list: { _id: string; temp: number }[]): Promise<ITank[]> {
    const bulkOps = list.map(item => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { 'settings.temp': item.temp } }
      }
    }));
    if (bulkOps.length === 0) return [];
    await Tank.bulkWrite(bulkOps);
    // Return updated tank
    const ids = list.map(item => item._id);
    return await Tank.find({ _id: { $in: ids } });
  }


  /**
   * Get all tanks where setting.chemistry exists
   */
  async getTanksWithChemistrySetting(): Promise<ITank[]> {
    return await Tank.find({ 'settings.chemistry': { $exists: true }, active: true });
  }


  /**
   * Update chemistry setting for a single tank
   */
  async updateChemistrySetting(id: string, chemistry: any): Promise<ITank> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid tank ID', 400);
    }
    const tank = await Tank.findByIdAndUpdate(
      id,
      { $set: { 'settings.chemistry': chemistry } },
      { new: true, runValidators: true }
    );
    if (!tank) {
      throw new AppError('No tank found with that ID', 404);
    }
    return tank;
  }

  /**
   * Batch update chemistry settings for multiple tanks
   */
  async batchUpdateChemistrySettings(list: { _id: string; chemistry: any }[]): Promise<ITank[]> {
    const bulkOps = list.map(item => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { 'settings.chemistry': item.chemistry } }
      }
    }));
    if (bulkOps.length === 0) return [];
    await Tank.bulkWrite(bulkOps);
    const ids = list.map(item => item._id);
    return await Tank.find({ _id: { $in: ids } });
  }

  /**
   * Insert or update a pump in settings.chemistry.pumps for a tank
   */
  async updateChemistryPumpSetting(id: string, pump: any): Promise<ITank> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid tank ID', 400);
    }
    const tank = await Tank.findById(id);
    if (!tank) {
      throw new AppError('No tank found with that ID', 404);
    }
    // Ensure chemistry exists
    if (!tank.settings) tank.settings = {};
    if (!tank.settings.chemistry) tank.settings.chemistry = { AHToAdded: 0, pumps: [] };
    const pumps = tank.settings.chemistry.pumps || [];
    const idx = pumps.findIndex((p: any) => p.pumpKey === pump.pumpKey);
    if (idx > -1) {
      // Update existing pump
      pumps[idx] = { ...pumps[idx], ...pump };
    } else {
      // Insert new pump
      pumps.push(pump);
    }
    tank.settings.chemistry.pumps = pumps;
    await tank.save();
    return tank;
  }
} 



