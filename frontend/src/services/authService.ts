import Cookies from 'js-cookie';
import { authenticatedFetch } from '../utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  // Add other user properties as needed based on your backend response
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: { token: string; user: User };
}

interface ProfileResponse {
    success: boolean;
    message: string;
    data: User;
}

export const fetchUserProfile = async (): Promise<ProfileResponse> => {
  try {
    const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data as ProfileResponse;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch user profile',
      data: {} as User,
    };
  }
};

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  return data as LoginResponse;
}; 