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
  const token = Cookies.get('auth_token'); // Get token from cookies
  
  if (!token) {
      // Handle case where token is missing, perhaps throw an error or return a specific structure
      // For now, returning a structure similar to an unsuccessful response
      return {
          success: false,
          message: 'Authentication token missing',
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

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users?limit=${limit}&page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
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

// Fetch a single user by ID
export const fetchUserById = async (id: string): Promise<FetchUserResponse> => {
  const token = Cookies.get('auth_token');

  if (!token) {
    return {
      success: false,
      message: 'Authentication token missing',
      data: {} as UserDataType, // Return empty data or null as appropriate for the interface
    };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${id}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();
  return data as FetchUserResponse;
};

// Create a new user
export const createUser = async (userData: UserPayload): Promise<CreateUserResponse> => {
  const token = Cookies.get('auth_token');

  if (!token) {
    return {
      success: false,
      message: 'Authentication token missing',
      data: {} as UserDataType,
    };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    }
  );

  const data = await response.json();
  return data as CreateUserResponse;
};

// Update an existing user
export const updateUser = async (id: string, userData: Partial<UserPayload>): Promise<UpdateUserResponse> => {
  const token = Cookies.get('auth_token');

  if (!token) {
    return {
      success: false,
      message: 'Authentication token missing',
      data: {} as UserDataType,
    };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    }
  );

  const data = await response.json();
  return data as UpdateUserResponse;
};

// Delete a user by ID
export const deleteUser = async (id: string): Promise<{ success: boolean; message?: string }> => {
  const token = Cookies.get('auth_token');

  if (!token) {
    return {
      success: false,
      message: 'Authentication token missing',
    };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${id}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  // No body expected for a successful DELETE, but backend might send success/message
  if (response.ok) {
     // Check for a body before trying to parse JSON
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
}; 