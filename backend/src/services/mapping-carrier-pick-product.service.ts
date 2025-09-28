import { MappingCarrierCode } from '@/models/mapping-carrier-pick-product-code.model';
import { PaginateResult } from '@/controllers/base.controller';
import mongoose from 'mongoose';



export class MappingCarrierCodeService {
  /**
   * Create a new mapping
   */
  async create(data: any): Promise<any> {
    const mappingCarrierCode = await MappingCarrierCode.create(data);
    return mappingCarrierCode;
  }

  /**
   * Get one by query
   */
  async getOneByQuery(query: {carrierPickId ? :any, productCode ? : any}): Promise<any> {
    const {
        carrierPickId, productCode
    } = query;

    
    return await MappingCarrierCode.findOne(query);
  }

  
  /**
   * Update
   */
  async updateByCondition(query: {carrierPickId ? :any, productCode ? : any}, payload:{carrierPickId ? :any, productCode ? : any}): Promise<any> {
    return await MappingCarrierCode.findOneAndUpdate(query, payload, { new: true });
  }
} 