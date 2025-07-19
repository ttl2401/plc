import { LiquidWarning, LiquidWarning as ILiquidWarning } from '@/models/liquid-warning.model';
import { PaginateResult } from '@/controllers/base.controller';
import mongoose from 'mongoose';
import moment = require('moment');

interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  select?: string;
  tank?: string;
  date?: string;
  warningLevel?: string;
  from?: string;
  to?: string;
  [key: string]: any;
}

export class LiquidWarningService {
  /**
   * Create a new liquid warning
   */
  async createLiquidWarning(data: Partial<ILiquidWarning>): Promise<ILiquidWarning> {
    const liquidWarning = await LiquidWarning.create(data);
    return liquidWarning;
  }

  /**
   * Get all liquid warnings with pagination and filtering
   */
  async getLiquidWarnings(query: QueryOptions): Promise<PaginateResult<ILiquidWarning>> {
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      select = '',
      tank,
      warningLevel,
      from,
      to
    } = query;

    const options = {
      page: Number(page),
      limit: Number(limit),
      sort,
      select,
      pagination: Number(limit) === 0 ? false : true
    };

    const queryFilters: Record<string, any> = {};

    if (tank) {
      queryFilters.tank = tank;
    }
    if (warningLevel) {
      queryFilters.warningLevel = warningLevel;
    }
    if (from || to) {
      queryFilters.date = {};
      if (from) {
        queryFilters.date.$gte = from;
      }
      if (to) {
        queryFilters.date.$lte = moment(to).endOf('day').format('YYYY-MM-DD');
      }
    }
    return await LiquidWarning.paginate(queryFilters, options);
  }

  /**
   * Get a single liquid warning by ID
   */
  async getLiquidWarningById(id: string): Promise<ILiquidWarning | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await LiquidWarning.findById(id);
  }

  /**
   * Update a liquid warning by ID
   */
  async updateLiquidWarning(id: string, updateData: Partial<ILiquidWarning>): Promise<ILiquidWarning | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await LiquidWarning.findByIdAndUpdate(id, updateData, { new: true });
  }

  /**
   * Delete a liquid warning by ID
   */
  async deleteLiquidWarning(id: string): Promise<ILiquidWarning | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await LiquidWarning.findByIdAndDelete(id);
  }

  /**
   * Get all liquid warnings without pagination, sorted by createdAt ascending (for Excel export)
   */
  async getAllLiquidWarningsSorted(): Promise<ILiquidWarning[]> {
    return await LiquidWarning.find().sort({ createdAt: 1 }).lean();
  }
} 