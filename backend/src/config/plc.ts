import { PLCService } from "@/services/plc.service";

export const checkPlcConnection = async () => {
    try {
      const plcService = new PLCService();
      const isConnected = plcService.checkConnected();
      if (!isConnected) {
        console.error('Error PLC not connected');
      }
      else {
        console.log('PLC connected!');
      }
    } catch (error) {
      console.error('Error PLC not connected with this error: ', error);
    }
  }; 