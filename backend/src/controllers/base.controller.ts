interface PaginationData {
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

interface ErrorResponse {
  success: false;
  code: number;
  message: string;
  error: {
    message: string;
  };
}

interface PaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  pagination: PaginationData;
}

export interface PaginateResult<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page?: number | undefined;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage?: number | null;
  nextPage?: number | null;
}

/**
 * Returns a success response with data and optional message
 */
export const returnMessage = <T>(data: T, message: string = 'success'): SuccessResponse<T> => {
  return {
    success: true,
    message,
    data,
  };
};

/**
 * Returns an error response with message and optional additional details
 */
export const returnError = (
  message: string | Error,
  additionalMessage: string | Error | null = null,
  errorCode: number = -1
): ErrorResponse => {
  if (message instanceof Error) {
    return {
      success: false,
      code: errorCode,
      message: message.message || 'got an exception',
      error: {
        message: message.message || 'something went wrong',
      },
    };
  }

  return {
    success: false,
    message,
    code: errorCode,
    error: {
      message: additionalMessage instanceof Error
        ? additionalMessage.message || 'got an exception'
        : additionalMessage || 'something went wrong',
    },
  };
};

/**
 * Returns a paginated success response with data and pagination info from mongoose-paginate-v2 result
 */
export const returnPaginationMessage = <T>(
  result: PaginateResult<T>,
  message: string = 'success'
): PaginatedResponse<T> => {
  return {
    success: true,
    message,
    data: result.docs,
    pagination: {
      totalDocs: result.totalDocs,
      limit: result.limit,
      totalPages: result.totalPages,
      page: result.page || 1,
      pagingCounter: result.pagingCounter,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage || null,
      nextPage: result.nextPage || null,
    },
  };
};