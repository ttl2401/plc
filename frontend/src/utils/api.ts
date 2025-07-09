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

  let headers: any = {
    'Authorization': `Bearer ${token}`,
    ...(options?.headers || {}),
  };

  // Only set Content-Type if not uploading FormData
  if (!(options?.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error('Unauthorized');
  }

  return response;
};

// i18n translation loader
export async function loadTranslations(lang: string): Promise<Record<string, string>> {
  const res = await fetch(`/locales/${lang}.json`);
  if (!res.ok) throw new Error('Failed to load translations');
  return res.json();
}