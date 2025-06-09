import Cookies from 'js-cookie';

export const handleUnauthorized = () => {
  // Clear auth token and redirect to login page
  Cookies.remove('auth_token');
  window.location.href = '/auth/login';
};

export const authenticatedFetch = async (url: string, options?: RequestInit) => {
  const token = Cookies.get('auth_token');

  if (!token) {
    handleUnauthorized();
    throw new Error('Authentication token missing');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options?.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error('Unauthorized');
  }

  return response;
}; 