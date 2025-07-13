import { Request, Response, NextFunction } from 'express';
import { TankGroupService } from '../services/tank-group.service';
import { returnMessage, returnError, returnPaginationMessage } from '@/controllers/base.controller';

const tankGroupService = new TankGroupService();

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