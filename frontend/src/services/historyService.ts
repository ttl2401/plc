import { authenticatedFetch } from '../utils/api';

export interface HistoryOperation {
  _id: string;
  action: string;
  date: string;
  startedAt: string;
  endedAt: string;
  createdAt?: string;
  updatedAt?: string;
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

export interface FetchHistoryOperationResponse {
  success: boolean;
  message: string;
  data: HistoryOperation[];
  pagination: PaginateResult<HistoryOperation>;
}

export const getHistoryOperation = async ({ page = 1, limit = 10, action = '', from = '', to = '' }) : Promise<FetchHistoryOperationResponse> => {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (action) params.append('action', action);
  if (from) params.append('from', from);
  if (to) params.append('to', to);

  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/history/operating?${params.toString()}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await response.json();
  return data as FetchHistoryOperationResponse;
};

export interface Pump {
  startedAt: string | null;
  endedAt: string | null;
}

export interface HistoryChemicalAddition {
  _id: string;
  action: string;
  date: string;
  pumps: Pump[];
  ampereConsumption: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FetchHistoryChemicalAdditionResponse {
  success: boolean;
  message: string;
  data: HistoryChemicalAddition[];
  pagination: PaginateResult<HistoryChemicalAddition>;
}

export const getHistoryChemicalAddition = async ({ page = 1, limit = 10, action = '', from = '', to = '' }) : Promise<FetchHistoryChemicalAdditionResponse> => {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (action) params.append('action', action);
  if (from) params.append('from', from);
  if (to) params.append('to', to);

  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/history/chemical-addition?${params.toString()}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await response.json();
  return data as FetchHistoryChemicalAdditionResponse;
};

export interface HistoryWaterAddition {
  _id: string;
  action: string;
  date: string;
  startedAt: string;
  endedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FetchHistoryWaterAdditionResponse {
  success: boolean;
  message: string;
  data: HistoryWaterAddition[];
  pagination: PaginateResult<HistoryWaterAddition>;
}

export const getHistoryWaterAddition = async ({ page = 1, limit = 10, action = '', from = '', to = '' }) : Promise<FetchHistoryWaterAdditionResponse> => {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (action) params.append('action', action);
  if (from) params.append('from', from);
  if (to) params.append('to', to);

  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/history/water-addition?${params.toString()}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await response.json();
  return data as FetchHistoryWaterAdditionResponse;
};

export const downloadHistoryOperation = async ({ action = '', from = '', to = '' }) => {
  const params = new URLSearchParams();
  if (action) params.append('action', action);
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/history/operating/download?${params.toString()}`;
  const response = await authenticatedFetch(url, { method: 'GET' });
  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = 'history-operating.xlsx';
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const downloadHistoryChemicalAddition = async ({ action = '', from = '', to = '' }) => {
  const params = new URLSearchParams();
  if (action) params.append('action', action);
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/history/chemical-addition/download?${params.toString()}`;
  const response = await authenticatedFetch(url, { method: 'GET' });
  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = 'history-chemical-addition.xlsx';
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const downloadHistoryWaterAddition = async ({ action = '', from = '', to = '' }) => {
  const params = new URLSearchParams();
  if (action) params.append('action', action);
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/history/water-addition/download?${params.toString()}`;
  const response = await authenticatedFetch(url, { method: 'GET' });
  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = 'history-water-addition.xlsx';
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export interface LiquidWarning {
  _id: string;
  tank: string;
  date: string;
  warningAt: string;
  warningLevel: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FetchLiquidWarningResponse {
  success: boolean;
  message: string;
  data: LiquidWarning[];
  pagination: PaginateResult<LiquidWarning>;
}

export const getLiquidWarning = async ({ page = 1, limit = 10, tank = '', from = '', to = '' }) : Promise<FetchLiquidWarningResponse> => {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (tank) params.append('tank', tank);
  if (from) params.append('from', from);
  if (to) params.append('to', to);

  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/history/liquid-warning?${params.toString()}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await response.json();
  return data as FetchLiquidWarningResponse;
};

export const downloadLiquidWarning = async ({ tank = '', from = '', to = '' }) => {
  const params = new URLSearchParams();
  if (tank) params.append('tank', tank);
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/history/liquid-warning/download?${params.toString()}`;
  const response = await authenticatedFetch(url, { method: 'GET' });
  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = 'liquid-warning.xlsx';
  document.body.appendChild(link);
  link.click();
  link.remove();
}; 