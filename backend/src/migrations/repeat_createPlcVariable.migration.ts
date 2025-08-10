import { plcVariableConfig } from '@/config/plc.variable';
import { PlcVariable } from '@/models/plc-variable.model';



const migrate = async (): Promise<Boolean> => {
  for (const variable of plcVariableConfig){
    try {
      await PlcVariable.findOneAndUpdate({name: variable.name}, variable, {upsert: true});  
    }
    catch(e){
      console.error(e);
      return false;
    }
    
  }
  return true;
};

export { migrate }; 