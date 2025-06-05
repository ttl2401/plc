import Cookies from 'js-cookie';

interface UserDataType {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string; // Assuming date strings
  updatedAt: string;
}

interface PaginateResult<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number | undefined;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage?: number | null; // Allow undefined
  nextPage?: number | null; // Allow undefined
}

interface FetchUsersResponse {
  success: boolean;
  message: string;
  data: UserDataType[];
  pagination: PaginateResult<UserDataType>;
}

export const fetchUsers = async (
  page: number = 1,
  limit: number = 10
): Promise<FetchUsersResponse> => {
  const token = Cookies.get('auth_token'); // Get token from cookies
  
  if (!token) {
      // Handle case where token is missing, perhaps throw an error or return a specific structure
      // For now, returning a structure similar to an unsuccessful response
      return {
          success: false,
          message: 'Authentication token missing',
          data: [],
          pagination: {
              docs: [],
              totalDocs: 0,
              limit: limit,
              totalPages: 0,
              page: page,
              pagingCounter: 0,
              hasPrevPage: false,
              hasNextPage: false,
              prevPage: null,
              nextPage: null,
          }
      };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users?limit=${limit}&page=${page}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();
  
  // Assuming the backend response structure matches FetchUsersResponse
  return data as FetchUsersResponse;
}; 