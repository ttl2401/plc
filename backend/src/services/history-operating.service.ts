import { HistoryOperation, ACTIONS, HistoryOperation as IHistoryOperation } from '@/models/history-operating.model';
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

export class HistoryOperatingService {
  /**
   * Create a new history operation
   */
  async createHistoryOperation(data: Partial<IHistoryOperation>): Promise<IHistoryOperation> {
    const historyOperation = await HistoryOperation.create(data);
    return historyOperation;
  }

  /**
   * Get all history operations with pagination and filtering
   */
  async getHistoryOperations(query: QueryOptions): Promise<PaginateResult<IHistoryOperation>> {
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
      queryFilters.startedAt = {};
      if (from) {
        queryFilters.startedAt.$gte = new Date(from);
      }
      if (to) {
        queryFilters.startedAt.$lte =  moment(to).endOf('day').toDate();
      }
    }
    const sortOption = sort || { createdAt: -1 };
    const skip = (Number(page) - 1) * Number(limit);

    const pipeline: PipelineStage[] = [
      { $match: queryFilters },
      // Sắp xếp để đánh số đúng (cũ -> mới)
      { $sort: { date: 1, action: 1, startedAt: 1, ...sortOption } },
      {
        $setWindowFields: {
          partitionBy: { date: "$date", action: "$action" },
          sortBy: { startedAt: 1 }, // cũ -> mới, hoặc { startedAt: -1 } nếu muốn ngược lại
          output: {
            countPerDay: { $documentNumber: {} }
          }
        }
      },
      // Nếu muốn newest có countPerDay lớn nhất: sort lại (mới -> cũ)
      { $sort: sortOption },
      // Phân trang
      { $skip: skip },
      { $limit: Number(limit) }
    ];

    // Nếu muốn tổng số lượng record cho phân trang:
    const totalCount = await HistoryOperation.countDocuments(queryFilters);

    const data = await HistoryOperation.aggregate(pipeline);

    return {
      docs: data,
      totalDocs: totalCount,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalCount / limit),
      hasPrevPage: page > 1,
      hasNextPage: skip + data.length < totalCount,
      pagingCounter: (Number(page) - 1) * Number(limit) + 1,
    };

    // return await HistoryOperation.paginate(queryFilters, options);
  }

  /**
   * Get a single history operation by ID
   */
  async getHistoryOperationById(id: string): Promise<IHistoryOperation | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await HistoryOperation.findById(id);
  }

  /**
   * Update a history operation by ID
   */
  async updateHistoryOperation(id: string, updateData: Partial<IHistoryOperation>): Promise<IHistoryOperation | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await HistoryOperation.findByIdAndUpdate(id, updateData, { new: true });
  }

  /**
   * Delete a history operation by ID
   */
  async deleteHistoryOperation(id: string): Promise<IHistoryOperation | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await HistoryOperation.findByIdAndDelete(id);
  }

  /**
   * Get all history operations without pagination, sorted by createdAt ascending (for Excel export)
   */
  async getAllHistoryOperationsSorted(): Promise<IHistoryOperation[]> {
    return await HistoryOperation.find().sort({ createdAt: 1 }).lean();
  }
} 