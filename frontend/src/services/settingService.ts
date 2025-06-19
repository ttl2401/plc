import { authenticatedFetch } from '../utils/api';

export interface TankGroup {
  _id: string;
  name: string;
  settings?: {
    timer: string;
  } | null;
}

export interface FetchTimerSettingsResponse {
  success: boolean;
  message: string;
  data: TankGroup[];
}

export interface UpdateTimerSettingsResponse {
  success: boolean;
  message: string;
  data: TankGroup[];
}

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

export const updateTimerSettings = async (payload: { [id: string]: string }): Promise<UpdateTimerSettingsResponse> => {
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

// You can add more settings-related API functions here as needed. 