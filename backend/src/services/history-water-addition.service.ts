import { HistoryWaterAddition, ACTIONS, HistoryWaterAddition as IHistoryWaterAddition } from '@/models/history-water-addition.model';
import { PaginateResult } from '@/controllers/base.controller';
import mongoose from 'mongoose';
import moment = require('moment');

interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  select?: string;
  action?: string;
  date?: string;
  [key: string]: any;
}

export class HistoryWaterAdditionService {
  /**
   * Create a new history water addition
   */
  async createHistoryWaterAddition(data: Partial<IHistoryWaterAddition>): Promise<IHistoryWaterAddition> {
    const historyWaterAddition = await HistoryWaterAddition.create(data);
    return historyWaterAddition;
  }

  /**
   * Get all history water additions with pagination and filtering
   */
  async getHistoryWaterAdditions(query: QueryOptions): Promise<PaginateResult<IHistoryWaterAddition>> {
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      select = '',
      action,
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

    if (action) {
      queryFilters.action = action;
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
    return await HistoryWaterAddition.paginate(queryFilters, options);
  }

  /**
   * Get a single history water addition by ID
   */
  async getHistoryWaterAdditionById(id: string): Promise<IHistoryWaterAddition | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await HistoryWaterAddition.findById(id);
  }

  /**
   * Update a history water addition by ID
   */
  async updateHistoryWaterAddition(id: string, updateData: Partial<IHistoryWaterAddition>): Promise<IHistoryWaterAddition | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await HistoryWaterAddition.findByIdAndUpdate(id, updateData, { new: true });
  }

  /**
   * Delete a history water addition by ID
   */
  async deleteHistoryWaterAddition(id: string): Promise<IHistoryWaterAddition | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await HistoryWaterAddition.findByIdAndDelete(id);
  }

  /**
   * Get all history water additions without pagination, sorted by createdAt ascending (for Excel export)
   */
  async getAllHistoryWaterAdditionsSorted(): Promise<IHistoryWaterAddition[]> {
    return await HistoryWaterAddition.find().sort({ createdAt: 1 }).lean();
  }
} 