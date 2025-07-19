import { Request, Response, NextFunction } from 'express';
import { TankGroupService } from '../services/tank-group.service';
import { TankService } from '../services/tank.service';
import { returnMessage, returnError, returnPaginationMessage } from '@/controllers/base.controller';

const tankGroupService = new TankGroupService();
const tankService = new TankService();

export const getTankGroups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get all tank groups, no limit
    const groups = await tankGroupService.getTankGroups({ limit: 0 });
    // Only return name and key fields
    const data = groups.docs.map((g: any) => ({ name: g.name, key: g.key }));
    res.json(returnMessage(data, 'Fetch tank group successfully'));
  } catch (err) {
    next(err);
  }
}; 


export const getTanks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get all active tanks, no limit
    const tanks = await tankService.getAllActiveTanks();
    // Only return name and key fields
    const data = tanks.map((g: any) => ({ name: g.name, key: g.key }));
    res.json(returnMessage(data, 'Fetch tanks successfully'));
  } catch (err) {
    next(err);
  }
}; 