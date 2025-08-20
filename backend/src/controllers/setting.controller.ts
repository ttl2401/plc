import { Request, Response, NextFunction } from 'express';
import { returnMessage, returnError } from '@/controllers/base.controller';

import { TankGroupService } from '@/services/tank-group.service';
import { TankService } from '@/services/tank.service';
import { RobotService } from '@/services/robot.service';
import { PLCService } from '@/services/plc.service';
import { PlcVariableService } from '@/services/plc-variable.service';
const tankGroupService = new TankGroupService();
const tankService = new TankService();
const robotService = new RobotService();
const plcService = new PLCService();
const plcVariableService = new PlcVariableService();

import { getListSettingTimer } from '@/transforms/tank-group.transform'
import { getListSettingTemperature, getListSettingChemistry } from '@/transforms/tank.transform'
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
    
    const plcVariables = list.map((e: { _id: string; temp: number; plcVariableName: string }) => ({
      name: e.plcVariableName,
      value: e.temp
    }))
    const updatePLCVariable = await plcVariableService.updateMultipleVariables(plcVariables);
    
    const updatedPLC = await plcService.writeMultipleVariablesToPLC(updatePLCVariable);
    
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

export const getSettingChemistry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get all tanks with chemistry setting
    const tanks = await tankService.getTanksWithChemistrySetting();
    const data = getListSettingChemistry(tanks);
    return res.status(200).json(returnMessage(data, 'Tanks with chemistry setting retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateSettingChemistry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { list } = req.body;
    let result;
    if (Array.isArray(list)) {
      // Batch update
      result = await tankService.batchUpdateChemistrySettings(list);
    } else if (list && list._id && list.chemistry) {
      // Single update
      result = await tankService.updateChemistrySetting(list._id, list.chemistry);
    } else {
      return res.status(400).json(returnError('Invalid payload for chemistry update'));
    }
    return res.status(200).json(returnMessage(result, 'Chemistry settings updated successfully'));
  } catch (error) {
    next(error);
  }
};