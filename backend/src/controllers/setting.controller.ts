import { Request, Response, NextFunction } from 'express';
import { returnMessage, returnError } from '@/controllers/base.controller';

import { TankGroupService } from '@/services/tank-group.service';
const tankGroupService = new TankGroupService();
import { getListSettingTimer } from '@/transforms/tank-group.transform'

export const getSettingTimer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      
      const tankGroups = await tankGroupService.getTankGroupsWithTimerSetting();
      const data = getListSettingTimer(tankGroups);
      return res.status(200).json(returnMessage(data, 'Tank Groups with timer setting retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }; 

export const updateSettingTimer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { list } = req.body;
    const arraySettings = list.map((e: { tankGroupId: string; timer: number }) => ({
      tankGroupId: e.tankGroupId,
      timer: e.timer
    }));
    const updatedTankGroups = await tankGroupService.batchUpdateTimerSettings(arraySettings);
    return res.status(200).json(returnMessage(updatedTankGroups, 'Timer settings updated successfully'));
  } catch (error) {
    next(error);
  }
};

  