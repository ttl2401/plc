import { Request, Response, NextFunction } from 'express';
import { returnMessage } from '@/controllers/base.controller';
import { TankGroup } from '@/models/tank-group.model';
import { TankGroupService } from '@/services/tank-group.service';

export const getSettingTimer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tankGroupService = new TankGroupService();
      const tankGroups = await tankGroupService.getTankGroupsWithTimerSetting();
      return res.status(200).json(returnMessage(tankGroups, 'Tank groups with timer setting retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }; 