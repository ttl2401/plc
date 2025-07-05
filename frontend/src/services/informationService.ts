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