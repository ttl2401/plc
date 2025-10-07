import { Request, Response, NextFunction } from 'express';
import { PlcVariableService } from '../services/plc-variable.service';
import { PLCService } from '../services/plc.service';
import { returnMessage, returnError, returnPaginationMessage } from '@/controllers/base.controller';

const plcVariableService = new PlcVariableService();
const plcService = new PLCService();

export const getPLCVariablesRobot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First get variables from MongoDB
    // const variables = await plcVariableService.getVariables({type: 'plc_control'});
    
    // Then read current values from PLC
    const variablesWithPLCValues = await plcService.readVariablesFromPLC({type: 'plc_control'});
    
    res.json(returnMessage(variablesWithPLCValues, `Retrieved ${variablesWithPLCValues.length} PLC variables successfully`));
  } catch (err) {
    next(err);
  }
};

export const updateVariableRobot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { variables } = req.body;
    
    // Update variables in MongoDB
    const updatedVariables = await plcVariableService.updateMultipleVariables(variables, 'plc_control');
    
    // Write variables to PLC
    const plcResults = await plcService.writeMultipleVariablesToPLC(variables);
    
    // Check if all PLC writes were successful
    const allSuccessful = plcResults.every(result => result === true);
    
    if (allSuccessful) {
      res.json(returnMessage(updatedVariables, `Updated ${updatedVariables.length} variables successfully in both database and PLC`));
    } else {
      // Some PLC writes failed, but database updates succeeded
      const failedCount = plcResults.filter(result => result === false).length;
      res.json(returnMessage(updatedVariables, `Updated ${updatedVariables.length} variables in database, but ${failedCount} PLC writes failed`));
    }
  } catch (err) {
    next(err);
  }
}; 


export const getPLCVariablesChecklist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First get variables from MongoDB
    // const variables = await plcVariableService.getVariables({type: 'plc_control'});
    
    // Then read current values from PLC
    const variablesWithPLCValues = await plcService.readVariablesFromPLC({type: 'plc_checklist_control'});
    
    res.json(returnMessage(variablesWithPLCValues, `Retrieved ${variablesWithPLCValues.length} PLC variables successfully`));
  } catch (err) {
    next(err);
  }
};


export const updateVariableChecklist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { variables } = req.body;
    
    // Update variables in MongoDB
    const updatedVariables = await plcVariableService.updateMultipleVariables(variables, 'plc_checklist_control');
    
    // Write variables to PLC
    const plcResults = await plcService.writeMultipleVariablesToPLC(variables);
    
    // Check if all PLC writes were successful
    const allSuccessful = plcResults.every(result => result === true);
    
    if (allSuccessful) {
      res.json(returnMessage(updatedVariables, `Updated ${updatedVariables.length} variables successfully in both database and PLC`));
    } else {
      // Some PLC writes failed, but database updates succeeded
      const failedCount = plcResults.filter(result => result === false).length;
      res.json(returnMessage(updatedVariables, `Updated ${updatedVariables.length} variables in database, but ${failedCount} PLC writes failed`));
    }
  } catch (err) {
    next(err);
  }
}; 