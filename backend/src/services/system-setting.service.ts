import { SystemSetting, TYPES, SystemSetting as ISystemSetting } from '@/models/system-setting.model';
import { AppError } from '@/middlewares/error.middleware';

export class SystemSettingService {
  // Create or update a system setting by key
  async createOrUpdateByKey(settingData: { key: typeof TYPES[number]; value: any }): Promise<ISystemSetting> {
    const { key, value } = settingData;
    const setting = await SystemSetting.findOneAndUpdate(
      { key },
      { value },
      { new: true, upsert: true, runValidators: true }
    );
    return setting;
  }

  // Get a system setting by key
  async getByKey(key: typeof TYPES[number]): Promise<ISystemSetting | null> {
    return await SystemSetting.findOne({ key });
  }

  // Delete a system setting by key
  async deleteByKey(key: typeof TYPES[number]): Promise<void> {
    const setting = await SystemSetting.findOneAndDelete({ key });
    if (!setting) {
      throw new AppError('No system setting found with that key', 404);
    }
  }
} 