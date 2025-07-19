import { HistoryChemicalAddition, ACTIONS, HistoryChemicalAddition as IHistoryChemicalAddition } from '@/models/history-chemical-addition.model';
import { PaginateResult } from '@/controllers/base.controller';
import mongoose, { PipelineStage } from 'mongoose';
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

export class HistoryChemicalAdditionService {
  /**
   * Create a new history chemical addition
   */
  async createHistoryChemicalAddition(data: Partial<IHistoryChemicalAddition>): Promise<IHistoryChemicalAddition> {
    const historyChemicalAddition = await HistoryChemicalAddition.create(data);
    return historyChemicalAddition;
  }

  /**
   * Get all history chemical additions with pagination and filtering
   */
  async getHistoryChemicalAdditions(query: QueryOptions): Promise<PaginateResult<IHistoryChemicalAddition>> {
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
    console.log("query filter", query)
    return await HistoryChemicalAddition.paginate(queryFilters, options);
    
  }

  /**
   * Get a single history chemical addition by ID
   */
  async getHistoryChemicalAdditionById(id: string): Promise<IHistoryChemicalAddition | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await HistoryChemicalAddition.findById(id);
  }

  /**
   * Update a history chemical addition by ID
   */
  async updateHistoryChemicalAddition(id: string, updateData: Partial<IHistoryChemicalAddition>): Promise<IHistoryChemicalAddition | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await HistoryChemicalAddition.findByIdAndUpdate(id, updateData, { new: true });
  }

  /**
   * Delete a history chemical addition by ID
   */
  async deleteHistoryChemicalAddition(id: string): Promise<IHistoryChemicalAddition | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await HistoryChemicalAddition.findByIdAndDelete(id);
  }

  /**
   * Get all history chemical additions without pagination, sorted by createdAt ascending (for Excel export)
   */
  async getAllHistoryChemicalAdditionsSorted(): Promise<IHistoryChemicalAddition[]> {
    return await HistoryChemicalAddition.find().sort({ createdAt: 1 }).lean();
  }
} 