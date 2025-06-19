import { authenticatedFetch } from '../utils/api';

interface UserDataType {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string; // Assuming date strings
  updatedAt: string;
}

interface PaginateResult<T> {
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

// New interfaces for single user response, create, and update
interface FetchUserResponse {
  success: boolean;
  message: string;
  data: UserDataType; // Single user data
}

interface CreateUserResponse {
  success: boolean;
  message: string;
  data: UserDataType; // Created user data
}

interface UpdateUserResponse {
  success: boolean;
  message: string;
  data: UserDataType; // Updated user data
}

interface UserPayload {
  name: string;
  email: string;
  password?: string; // Password optional for update
  role: string;
}

export const fetchUsers = async (
  page: number = 1,
  limit: number = 10,
  search: string = ''
): Promise<FetchUsersResponse> => {
  try {
    const response = await authenticatedFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users?limit=${limit}&page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    return data as FetchUsersResponse;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch users',
      data: [],
      pagination: {
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
};

// Fetch a single user by ID
export const fetchUserById = async (id: string): Promise<FetchUserResponse> => {
  try {
    const response = await authenticatedFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${id}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    return data as FetchUserResponse;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch user',
      data: {} as UserDataType,
    };
  }
};

// Create a new user
export const createUser = async (userData: UserPayload): Promise<CreateUserResponse> => {
  try {
    const response = await authenticatedFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      }
    );

    const data = await response.json();
    return data as CreateUserResponse;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to create user',
      data: {} as UserDataType,
    };
  }
};

// Update an existing user
export const updateUser = async (id: string, userData: Partial<UserPayload>): Promise<UpdateUserResponse> => {
  try {
    const response = await authenticatedFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      }
    );

    const data = await response.json();
    return data as UpdateUserResponse;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update user',
      data: {} as UserDataType,
    };
  }
};

// Delete a user by ID
export const deleteUser = async (id: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await authenticatedFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${id}`,
      {
        method: 'DELETE',
      }
    );

    if (response.ok) {
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      return {
        success: true,
        message: data.message || 'User deleted successfully',
      };
    } else {
      const data = await response.json();
      return {
        success: false,
        message: data.message || 'Failed to delete user',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to delete user',
    };
  }
}; 