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