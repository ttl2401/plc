import { authenticatedFetch } from '../utils/api';

export interface PlatingTankGroup {
  model: string;
  modelId: string;
  modelKey: string;
  modelName: string;
  currentJig?: number;
  currentTotal?: number;
  T1?: number;
  T2?: number;
}

export interface PlatingProduct {
  _id: string;
  code: string;
  name: string;
  sizeDm2: number;
  imageUrl?: string;
  mode: 'rack' | 'barrel';
  rackPlating?: {
    jigCarrier: number;
    pcsJig: number;
    timer: number;
    tankAndGroups: PlatingTankGroup[];
  };
  barrelPlating?: {
    kgBarrel: number;
    timer: number;
    tankAndGroups: PlatingTankGroup[];
  };
}

export interface PaginateResult<T> {
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number | undefined;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage?: number | null;
  nextPage?: number | null;
}

export interface FetchInformationPlatingResponse {
  success: boolean;
  message: string;
  data: PlatingProduct[];
  pagination: PaginateResult<PlatingProduct>;
}

export const fetchInformationPlating = async ({ page = 1, limit = 10, search = '', mode = '', line = 1 }) : Promise<FetchInformationPlatingResponse> => {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (search) params.append('search', search);
  if (mode) params.append('mode', mode);
  if (line) params.append('line', String(line));

  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/information/plating?${params.toString()}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await response.json();
  return data as FetchInformationPlatingResponse;
};

export const handleExportExcel = async ({ line = 1, mode = '', limit = 0 }: { line?: number; mode?: string; limit?: number }) => {
  try {
    const params = new URLSearchParams();
    params.append('line', String(line));
    if (mode) params.append('mode', mode);
    if (limit > 0) params.append('limit', String(limit));

    const response = await authenticatedFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/information/plating/download?${params.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    // Get the filename from the response headers or use a default name
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'plating-information.xlsx'
      : 'plating-information.xlsx';

    // Create a blob from the response
    const blob = await response.blob();
    
    // Create a download link and trigger the download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
}; 

export interface TankInfo {
  name: string;
  timeIn: number;
  timeOut: number;
  temperature?: number;
  ampere?: number;
  slot?: number;
}

export interface InformationTemperature {
  code: string;
  tanks: TankInfo[];
}

export interface FetchInformationTemperatureResponse {
  success: boolean;
  message: string;
  data: InformationTemperature[];
  pagination: PaginateResult<InformationTemperature>;
}

export const fetchInformationTemperature = async ({ page = 1, limit = 10, search = '' }) : Promise<FetchInformationTemperatureResponse> => {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (search) params.append('search', search);

  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/information/temperature?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await response.json();
  return data as FetchInformationTemperatureResponse;
}; 

export const handleExportExcelTemperature = async ({ line = 1, search = '' }: { line?: number; search?: string }) => {
  try {
    const params = new URLSearchParams();
    params.append('line', String(line));
    if (search) params.append('search', search);

    const response = await authenticatedFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/information/temperature/download?${params.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    // Get the filename from the response headers or use a default name
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'information-temperature.xlsx'
      : 'information-temperature.xlsx';

    // Create a blob from the response
    const blob = await response.blob();
    // Create a download link and trigger the download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
}; 

export interface TimerTankInfo {
  name: string;
  code: string;
  model: string;
  timeIn: number;
  timeOut: number;
  slot?: number;
}

export interface NewTimerTankInfo {
  tankId: number;
  tankKey: string;
  enteredAt: string | null;
  exitedAt: string | null;
  tank: {
    key: string;
    groupKey: string;
    name: string;
  };
}

export interface InformationTimer {
  code: string;
  tanks: TimerTankInfo[];
}

export interface NewInformationTimer {
  productCode: string;
  carrierPick: number;
  lastEventTime: string;
  tanks: NewTimerTankInfo[];
}

export interface FetchInformationTimerResponse {
  success: boolean;
  message: string;
  data: InformationTimer[];
  pagination: PaginateResult<InformationTimer>;
}

export const fetchInformationTimer = async ({ page = 1, limit = 10, search = '', line = 1, from = '', to = '', tank = '' }) : Promise<FetchInformationTimerResponse> => {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (search) params.append('search', search);
  if (line) params.append('line', String(line));
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  if (tank) params.append('tank', tank);

  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/information/timer?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await response.json();
  return data as FetchInformationTimerResponse;
};

export const handleExportExcelTimer = async ({ line = 1, search = '', from = '', to = '', tank = '' }: { line?: number; search?: string; from?: string; to?: string; tank?: string }) => {
  try {
    const params = new URLSearchParams();
    params.append('line', String(line));
    if (search) params.append('search', search);
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (tank) params.append('tank', tank);

    const response = await authenticatedFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/information/timer/download?${params.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    // Get the filename from the response headers or use a default name
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'information-timer.xlsx'
      : 'information-timer.xlsx';

    // Create a blob from the response
    const blob = await response.blob();
    // Create a download link and trigger the download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
}; 

export interface FetchInformationTimerDetailResponse {
  success: boolean;
  message: string;
  data: NewInformationTimer;
}

export const fetchInformationTimerDetail = async (code: string, carrierPick?: number): Promise<FetchInformationTimerDetailResponse> => {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/information/timer/${code}`;
  if (carrierPick !== undefined) {
    url += `/${carrierPick}`;
  }
  
  const response = await authenticatedFetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}; 