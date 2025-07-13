import { authenticatedFetch } from '../utils/api';

export interface TankGroup {
  name: string;
  key: string;
}

export interface GetTankGroupResponse {
  data: TankGroup[];
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