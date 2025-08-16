import { authenticatedFetch } from '../utils/api';

export interface PLCVariable {
  _id: string;
  name: string;
  __v: number;
  createdAt: string;
  dataType: string;
  dbNumber: number;
  offset: number;
  startValue: boolean | number;
  type: string;
  updatedAt: string;
  value: boolean | number;
}

export interface PLCVariablesResponse {
  success: boolean;
  message: string;
  data: PLCVariable[];
}


export const fetchPLCTemperatureVariables = async (): Promise<PLCVariablesResponse> => {
  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/plc/parameter/temperature`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response.json();
};

export const fetchPLCElectricityVariables = async (): Promise<PLCVariablesResponse> => {
  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/plc/parameter/electricity`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response.json();
};