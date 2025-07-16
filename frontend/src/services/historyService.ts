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