import { Robot, IRobot } from '@/models/robot.model';
import { AppError } from '@/middlewares/error.middleware';
import mongoose from 'mongoose';

interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  select?: string;
  search?: string;
  [key: string]: any;
}

export class RobotService {
  /**
   * Create a new robot
   */
  async createRobot(robotData: Partial<IRobot>): Promise<IRobot> {
    try {
      const robot = await Robot.create(robotData);
      return robot;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError('Robot with this key already exists', 400);
      }
      throw error;
    }
  }

  /**
   * Get all robots with pagination and filtering
   */
  async getRobots(query: QueryOptions): Promise<any> {
    const { page = 1, limit = 10, sort = { name: 1 }, select = '', search } = query;
    const options = {
      page: Number(page),
      limit: Number(limit),
      sort,
      select,
    };
    const queryFilters: Record<string, any> = {};
    if (search) {
      queryFilters.name = { $regex: search, $options: 'i' };
    }
    // If you use mongoose-paginate-v2, uncomment the next line:
    // return await Robot.paginate(queryFilters, options);
    // Otherwise, use regular find with skip/limit:
    return await Robot.find(queryFilters)
      .sort(sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .select(select);
  }

  /**
   * Get a single robot by ID
   */
  async getRobotById(id: string): Promise<IRobot> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid robot ID', 400);
    }
    const robot = await Robot.findById(id);
    if (!robot) {
      throw new AppError('No robot found with that ID', 404);
    }
    return robot;
  }

  /**
   * Update a robot
   */
  async updateRobot(id: string, robotData: Partial<IRobot>): Promise<IRobot> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid robot ID', 400);
    }
    try {
      const robot = await Robot.findByIdAndUpdate(
        id,
        robotData,
        {
          new: true,
          runValidators: true,
        }
      );
      if (!robot) {
        throw new AppError('No robot found with that ID', 404);
      }
      return robot;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError('Robot with this key already exists', 400);
      }
      throw error;
    }
  }

  /**
   * Delete a robot
   */
  async deleteRobot(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid robot ID', 400);
    }
    const robot = await Robot.findByIdAndDelete(id);
    if (!robot) {
      throw new AppError('No robot found with that ID', 404);
    }
  }

  /**
   * Get all active robots
   */
  async getActiveRobots(): Promise<IRobot[]> {
    return await Robot.find({ active: true }).sort({ name: 1 });
  }

  /**
   * Batch update rackSettings and barrelSettings for multiple robots
   */
  async batchUpdateSettings(list: { _id: string; name?:string, active?:boolean, rackSettings: any; barrelSettings: any }[]): Promise<IRobot[]> {
    const bulkOps = list.map(item => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { rackSettings: item.rackSettings, barrelSettings: item.barrelSettings } }
      }
    }));
    if (bulkOps.length === 0) return [];
    await Robot.bulkWrite(bulkOps);
    const ids = list.map(item => item._id);
    return await Robot.find({ _id: { $in: ids } });
  }
} 