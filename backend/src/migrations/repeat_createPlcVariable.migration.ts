import { plcControlButtonConfig, 
  temperatureVariableControl, 
  electricityVariableControl,
  settingTemperatureControl,
  carrierVariableInformation,
  plcChecklistButtonConfig,
  settingTimerControl
} from '@/config/plc.variable';
import { PlcVariable } from '@/models/plc-variable.model';



const migrate = async (): Promise<Boolean> => {
  for (const variable of plcControlButtonConfig){
    try {
      let exist = await PlcVariable.findOne({name: variable.name});  
      if(!exist){
        await PlcVariable.create(variable);
      }
    }
    catch(e){
      console.error(e);
      return false;
    }
    
  }

  for (const variable of temperatureVariableControl){
    try {
      let exist = await PlcVariable.findOne({name: variable.name});  
      if(!exist){
        const payload = {
          name: variable.name,
          dbNumber: variable.dbNumber,
          dataType: variable.dataType,
          offset: variable.offset,
          type: variable.type,
          startValue: variable.startValue,
          value: variable.value
        }
        await PlcVariable.create(payload);
      }
    }
    catch(e){
      console.error(e);
      return false;
    }
    
  }

  for (const variable of electricityVariableControl){
    try {
      let exist = await PlcVariable.findOne({name: variable.name});  
      if(!exist){
        const payload = {
          name: variable.name,
          dbNumber: variable.dbNumber,
          dataType: variable.dataType,
          offset: variable.offset,
          type: variable.type,
          startValue: variable.startValue,
          value: variable.value
        }
        await PlcVariable.create(payload);
      }
    }
    catch(e){
      console.error(e);
      return false;
    }
    
  }

  for (const variable of settingTemperatureControl){
    try {
      let exist = await PlcVariable.findOne({name: variable.name});  
      if(!exist){
        await PlcVariable.create(variable);
      }
    }
    catch(e){
      console.error(e);
      return false;
    }
    
  }

  for (const variable of carrierVariableInformation){
    try {
      if(variable.oldName){
        let exist = await PlcVariable.findOne({name: variable.oldName});  
        if(exist){
          await PlcVariable.updateOne({name: variable.oldName}, variable);
        }
      }else {
        let exist = await PlcVariable.findOne({name: variable.name});  
        if(!exist){
          await PlcVariable.create(variable);
        }
      }
      
    }
    catch(e){
      console.error(e);
      return false;
    }
  } 


  // Checklist control
  for (const variable of plcChecklistButtonConfig){
    try {
      let exist = await PlcVariable.findOne({name: variable.name});  
      if(!exist){
        await PlcVariable.create(variable);
      }
    }
    catch(e){
      console.error(e);
      return false;
    }
  } 

  // Setting Timer
  for (const variable of settingTimerControl){
    try {
      let exist = await PlcVariable.findOne({name: variable.name});  
      if(!exist){
        await PlcVariable.create(variable);
      }
    }
    catch(e){
      console.error(e);
      return false;
    }
  } 

  return true;
};

export { migrate }; 