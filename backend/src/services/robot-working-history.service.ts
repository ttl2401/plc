import { RobotWorkingHistory, IRobotWorkingHistory } from '@/models/robot-working-history.model';
import { AppError } from '@/middlewares/error.middleware';
import { PipelineStage } from 'mongoose';

interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  select?: string;
  search?: string;
  [key: string]: any;
}


type TanksRow = {
  tankId: number;
  tankKey: string;
  robotKey: string;
  enteredAt: Date | null;
  exitedAt: Date | null;
};

type GroupDoc = {
  productCode: string;
  carrierPick: number;
  tanks: TanksRow[];
  lastEventTime: Date | null; // để sort các group theo lần event mới nhất
};

type Paginate<T> = {
  docs: T[];
  totalDocs: number;
  totalPages: number;
  page: number;
  limit: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
};


export class RobotWorkingHistoryService {
  /**
   * Create a new history
   */
  async create(robotData: Partial<IRobotWorkingHistory>): Promise<IRobotWorkingHistory> {
    try {
      const history = await RobotWorkingHistory.create(robotData);
      return history;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get histories
   */
  async list(query: QueryOptions): Promise<any> {
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
    // Otherwise, use regular find with skip/limit:
    return await RobotWorkingHistory.find(queryFilters)
      .sort(sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .select(select);
  }

  async getListGroupByProductCode(): Promise<any> {

  }
  /**
   * Get a single history by product code
   */
  async getOneGroupByProductCode(code: string): Promise<any> {
    code = code.toUpperCase();
    const history = await RobotWorkingHistory.find({productCode: code});
    if (!history) {
      throw new AppError('No Record found with that product code', 404);
    }
    return history;
  }

  async getOneByQuery(query: any): Promise<any> {
    const history = await RobotWorkingHistory.findOne(query);
    return history;
  }

  /**
   * List robot working histories filtered by createdAt range, tankKey and productCode search.
   * Always sorts by createdAt ascending for correct enter/exit pairing downstream.
   */
  async listByFilters(params: {
    from?: number;        // UNIX seconds (optional)
    to?: number;          // UNIX seconds (optional)
    tank?: string;        // tankKey exact match (optional)
    search?: string;      // productCode LIKE (optional)
    page?: number;        // default 1
    limit?: number;       // default 10 (0 => lấy hết)
  }): Promise<Paginate<GroupDoc>> {
    const {
      from,
      to,
      tank,
      search,
      page = 1,
      limit = 10,
    } = params || {};
  
    // 1) Xây match ban đầu (lọc sớm để giảm dữ liệu)
    const match: Record<string, any> = {};
    if (tank?.trim()) match.tankKey = tank.trim();
    if (search?.trim()) match.productCode = { $regex: search.trim(), $options: 'i' };
    if (typeof from === 'number' || typeof to === 'number') {
      match.createdAt = {};
      if (typeof from === 'number') match.createdAt.$gte = new Date(from * 1000);
      if (typeof to === 'number') match.createdAt.$lte = new Date(to * 1000);
    }
  
    // 2) Pipeline:
    // - $match: lọc theo điều kiện
    // - $group (level 1): gộp theo (productCode, carrierPick, tankId, tankKey, robotKey)
    //   và lấy enteredAt = MIN(createdAt) của action='enter', exitedAt = MAX(createdAt) của action='exit'
    //   (dùng $max/$min + $cond để đảm bảo nếu có nhiều bản ghi vẫn cho kết quả đúng)
    // - $group (level 2): gom các tank lại theo (productCode, carrierPick)
    //   + tính lastEventTime để sort các group theo event mới nhất (max của entered/exited của từng tank)
    // - $project: định dạng đầu ra
    // - $sort: sort theo lastEventTime (desc)
    // - $facet: tách nhánh paginate (docs) và đếm (total)
    const pipeline: PipelineStage[] = [
      { $match: match },
      { $sort: { createdAt: 1 } }, // để min/max ổn định; không bắt buộc nhưng tốt
  
      {
        $group: {
          _id: {
            productCode: '$productCode',
            carrierPick: '$carrierPick',
            tankId: '$tankId',
            tankKey: '$tankKey',
          //  robotKey: '$robotKey', // nếu muốn tách record theo robotkey thì thêm row này
          },
          // nếu action='enter' → nhận createdAt, ngược lại null
          enteredAt: {
            $min: {
              $cond: [{ $eq: ['$action', 'enter'] }, '$createdAt', null],
            },
          },
          // nếu action='exit' → nhận createdAt, ngược lại null
          exitedAt: {
            $max: {
              $cond: [{ $eq: ['$action', 'exit'] }, '$createdAt', null],
            },
          },
        },
      },
      { $sort: { "_id.tankId": 1 } },
      {
        $group: {
          _id: {
            productCode: '$_id.productCode',
            carrierPick: '$_id.carrierPick',
          },
          tanks: {
            $push: {
              tankId: '$_id.tankId',
              tankKey: '$_id.tankKey',
            //  robotKey: '$_id.robotKey',
              enteredAt: '$enteredAt',
              exitedAt: '$exitedAt',
            },
          },
          // dùng để sort group theo thời điểm event mới nhất trong các tank
          lastEventTime: {
            $max: {
              $ifNull: [
                { $cond: [{ $gt: ['$exitedAt', '$enteredAt'] }, '$exitedAt', '$enteredAt'] },
                null,
              ],
            },
          },
        },
      },
  
      {
        $project: {
          _id: 0,
          productCode: '$_id.productCode',
          carrierPick: '$_id.carrierPick',
          tanks: 1,
          lastEventTime: 1,
        },
      },
  
      { $sort: { lastEventTime: -1, productCode: 1, carrierPick: 1 } },
  
      {
        $facet: {
          docs: [
            ...(limit === 0 ? [] : [{ $skip: (page - 1) * limit }, { $limit: limit }]),
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];
  
    const agg = await RobotWorkingHistory.aggregate(pipeline);
    const docs: GroupDoc[] = agg[0]?.docs ?? [];
    const totalDocs = agg[0]?.totalCount?.[0]?.count ?? 0;
  
    const realLimit = limit === 0 ? totalDocs || 1 : limit; // limit=0 → lấy hết
    const totalPages = realLimit > 0 ? Math.max(1, Math.ceil(totalDocs / realLimit)) : 1;
  
    return {
      docs,
      totalDocs,
      totalPages,
      page,
      limit: realLimit,
      pagingCounter: (page - 1) * realLimit + 1,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    };
  }
} 