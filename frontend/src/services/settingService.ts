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

// You can add more settings-related API functions here as needed. 