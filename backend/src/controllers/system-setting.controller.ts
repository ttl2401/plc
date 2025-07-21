import { Request, Response, NextFunction } from 'express';
import { SystemSettingService } from '../services/system-setting.service';
import { returnMessage, returnError } from '@/controllers/base.controller';
import { TYPES } from '@/models/system-setting.model';

const systemSettingService = new SystemSettingService();

export const getSystemSettingByKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key } = req.params;
    if (!TYPES.includes(key as typeof TYPES[number])) {
      return res.status(400).json(returnError('Invalid key', null, 400));
    }
    const setting = await systemSettingService.getByKey(key as typeof TYPES[number]);
    if (!setting) {
        return res.json(returnMessage({ value : null}, 'Unset value'));
    }
    return res.json(returnMessage(setting, 'System setting fetched successfully'));
  } catch (err) {
    next(err);
  }
};

export const createOrUpdateSystemSettingByKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json(returnError('Key and value are required', null, 400));
    }
    if (!TYPES.includes(key as typeof TYPES[number])) {
      return res.status(400).json(returnError('Invalid key', null, 400));
    }
    const setting = await systemSettingService.createOrUpdateByKey({ key, value });
    return res.json(returnMessage(setting, 'System setting created or updated successfully'));
  } catch (err) {
    next(err);
  }
}; 