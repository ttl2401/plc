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

export interface UpdatePLCVariableRequest {
  variables: {
    name: string;
    value: boolean | number;
  }[];
}

export interface UpdatePLCVariableResponse {
  success: boolean;
  message: string;
  data: {
    name: string;
    value: boolean | number;
  }[];
}

export const fetchPLCVariables = async (): Promise<PLCVariablesResponse> => {
  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/plc/variables/robot`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response.json();
};

export const updatePLCVariable = async (payload: UpdatePLCVariableRequest): Promise<UpdatePLCVariableResponse> => {
  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/plc/variables/robot`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );
  return response.json();
};
