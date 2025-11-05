
import { plcService } from '@/services/singleton.service';

export const checkPlcConnection = async () => {
    try {
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