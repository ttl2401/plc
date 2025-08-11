import { Request, Response, NextFunction } from 'express';
import { PLCService } from '../services/plc.service';
import { returnMessage, returnError, returnPaginationMessage } from '@/controllers/base.controller';

const plcService = new PLCService();


export const getPLCVariables = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const variables = await plcService.getVariables({type: 'plc_control'});
    res.json(returnMessage(variables, `Retrieved ${variables.length} PLC variables successfully`));
  } catch (err) {
    next(err);
  }
};

export const updateVariable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { variables } = req.body;
    for (const variable of variables) {
        const name = variable.name;
        const value = variable.value;
        await plcService.updateVariable(name, value, 'plc_control');

    }

    res.json(returnMessage(variables, `Update ${variables.length} variables successfully`));
  } catch (err) {
    next(err);
  }
}; 

