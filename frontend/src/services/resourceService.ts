import { authenticatedFetch } from '../utils/api';

export interface TankGroup {
  name: string;
  key: string;
}
export interface Tank {
  name: string;
  key: string;
}

export interface GetTankGroupResponse {
  data: TankGroup[];
}
export interface GetTankResponse {
  data: Tank[];
}

export const getTankGroup = async (): Promise<GetTankGroupResponse> => {
  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/tank-groups`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response.json();
}; 


export const getTanks = async (): Promise<GetTankResponse> => {
  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/tanks`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response.json();
}; 
