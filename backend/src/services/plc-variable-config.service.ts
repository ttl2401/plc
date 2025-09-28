import { PlcVariableConfig } from '@/models/plc-variable-config.model';

export class PlcVariableConfigService {
  /**
   * Create new
   */
  async create(data: any): Promise<any> {
    const instance = await PlcVariableConfig.create(data);
    return instance;
  }

  /**
   * Get record by key
   */
  async getByKey(key:string): Promise<any> {
    return await PlcVariableConfig.findOne({key : key});
  }

  
  /**
   * Update
   */
  async updateValueByKey(key: string, value: any): Promise<any> {
    return await PlcVariableConfig.updateOne({key : key}, {value: value}, { new: true, upsert: true });
  }
} 