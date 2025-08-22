import { Request, Response, NextFunction } from 'express';

import { PLCService } from '../services/plc.service';
import { returnMessage } from '@/controllers/base.controller';

const plcService = new PLCService();

export const getPLCTemperature = async (req: Request, res: Response, next: NextFunction) => {
  try {
  
    // Then read current values from PLC
    const variablesWithPLCValues = await plcService.readVariablesFromPLC({type: 'May_tinh_Nhiet_Muc'});
    for (let variable of variablesWithPLCValues ){
      variable.value = variable.value ? Math.round(variable.value * 100) / 100 : 0;
    }
    res.json(returnMessage(variablesWithPLCValues, `Retrieved ${variablesWithPLCValues.length} PLC variables successfully`));
  } catch (err) {
    next(err);
  }
};


export const getPLCElectricity = async (req: Request, res: Response, next: NextFunction) => {
  try {
  
    // Then read current values from PLC
    const variablesWithPLCValues = await plcService.readVariablesFromPLC({type: 'May_tinh_Chinh_luu_R'});
    
    res.json(returnMessage(variablesWithPLCValues, `Retrieved ${variablesWithPLCValues.length} PLC variables successfully`));
  } catch (err) {
    next(err);
  }
};