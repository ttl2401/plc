import { authenticatedFetch } from '../utils/api';

// interface for setting timer
export interface TimerSetting {
  _id: string;
  name: string;
  timer: number | null;
}

export interface FetchTimerSettingsResponse {
  success: boolean;
  message: string;
  data: TimerSetting[];
}

export interface UpdateTimerSettingsResponse {
  success: boolean;
  message: string;
  data: TimerSetting[];
}


// interface for temperature setting
export interface TempSetting {
  _id: string;
  name: string;
  temp: number | null;
}

export interface FetchTempSettingsResponse {
  success: boolean;
  message: string;
  data: TempSetting[];
}

export interface UpdateTempSettingsResponse {
  success: boolean;
  message: string;
  data: TempSetting[];
}


// API for timer setting
export const fetchTimerSettings = async (): Promise<FetchTimerSettingsResponse> => {
  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/settings/timer`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await response.json();
  return data as FetchTimerSettingsResponse;
};

export const updateTimerSettings = async (payload: { list: TimerSetting[] }): Promise<UpdateTimerSettingsResponse> => {
  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/settings/timer`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );
  const data = await response.json();
  return data as UpdateTimerSettingsResponse;
};


// API for temperature setting
export const fetchTemperatureSettings = async (): Promise<FetchTempSettingsResponse> => {
  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/settings/temperature`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await response.json();
  return data as FetchTempSettingsResponse;
};

export const updateTemperatureSettings = async (payload: { list: TempSetting[] }): Promise<UpdateTempSettingsResponse> => {
  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/settings/temperature`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );
  const data = await response.json();
  return data as UpdateTempSettingsResponse;
};

// interface for robot setting
export interface RobotSetting {
  _id: string;
  name: string;
  rackSettings: {
    topDwellTime: number;
    loweringWaitingTime: number;
    bottomDwellTime: number;
  };
  barrelSettings: {
    topDwellTime: number;
    loweringWaitingTime: number;
    bottomDwellTime: number;
  };
}

export interface FetchRobotSettingsResponse {
  success: boolean;
  message: string;
  data: RobotSetting[];
}

export interface UpdateRobotSettingsResponse {
  success: boolean;
  message: string;
  data: RobotSetting[];
}

export const fetchRobotSettings = async (): Promise<FetchRobotSettingsResponse> => {
  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/settings/robot`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await response.json();
  return data as FetchRobotSettingsResponse;
};

export const updateRobotSettings = async (payload: { list: RobotSetting[] }): Promise<UpdateRobotSettingsResponse> => {
  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/settings/robot`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );
  const data = await response.json();
  return data as UpdateRobotSettingsResponse;
};

// API for fetching product setting by productId and line
export interface ProductSetting {
  // Define fields as needed, for now use any
  [key: string]: any;
}

export interface FetchProductSettingResponse {
  success: boolean;
  message: string;
  data: ProductSetting;
}

export const fetchProductSetting = async (productId: string, line: number = 1): Promise<FetchProductSettingResponse> => {
  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${productId}/settings?line=${line}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await response.json();
  return data as FetchProductSettingResponse;
};


export const updateProductSetting = async (productId: string, payload: any): Promise<any> => {
  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${productId}/settings`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );
  return response.json();
}; 

// You can add more settings-related API functions here as needed. 