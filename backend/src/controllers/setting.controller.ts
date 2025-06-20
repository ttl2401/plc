import { Request, Response, NextFunction } from 'express';
import { returnMessage, returnError } from '@/controllers/base.controller';

import { TankGroupService } from '@/services/tank-group.service';
import { TankService } from '@/services/tank.service';
import { RobotService } from '@/services/robot.service';
const tankGroupService = new TankGroupService();
const tankService = new TankService();
const robotService = new RobotService();

import { getListSettingTimer } from '@/transforms/tank-group.transform'
import { getListSettingTemperature } from '@/transforms/tank.transform'
import { getListSettingRobot } from '@/transforms/robot.transform'

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
    const arraySettings = list.map((e: { _id: string; timer: number }) => ({
      _id: e._id,
      timer: e.timer
    }));
    const updatedTankGroups = await tankGroupService.batchUpdateTimerSettings(arraySettings);
    return res.status(200).json(returnMessage(updatedTankGroups, 'Timer settings updated successfully'));
  } catch (error) {
    next(error);
  }
};


export const getSettingTemperature = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    
    const tanks = await tankService.getTanksWithTempSetting();
    const data = getListSettingTemperature(tanks);
    return res.status(200).json(returnMessage(data, 'Tank with temperature setting retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateSettingTemperature = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { list } = req.body;
    const arraySettings = list.map((e: { _id: string; temp: number }) => ({
      _id: e._id,
      temp: e.temp
    }));
    const updatedTanks = await tankService.batchUpdateTempSettings(arraySettings);
    return res.status(200).json(returnMessage(updatedTanks, 'Temperature settings updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const getSettingRobot = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const robots = await robotService.getActiveRobots();
    const data = getListSettingRobot(robots);
    return res.status(200).json(returnMessage(data, 'Active robots retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateSettingRobot = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { list } = req.body;
    const updatedRobots = await robotService.batchUpdateSettings(list);
    return res.status(200).json(returnMessage(updatedRobots, 'Robot settings updated successfully'));
  } catch (error) {
    next(error);
  }
};