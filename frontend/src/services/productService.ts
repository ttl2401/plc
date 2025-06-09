import Cookies from 'js-cookie';

export interface ProductDataType {
  _id: string;
  code: string;
  sizeDm2: number;
  name: string;
  image: string;
  qrCode: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

interface PaginateResult<T> {
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

interface FetchProductsResponse {
  success: boolean;
  message: string;
  data: ProductDataType[];
  pagination: PaginateResult<ProductDataType>;
}

interface FetchProductResponse {
  success: boolean;
  message: string;
  data: ProductDataType;
}

interface CreateProductResponse {
  success: boolean;
  message: string;
  data: ProductDataType;
}

interface UpdateProductResponse {
  success: boolean;
  message: string;
  data: ProductDataType;
}

interface ProductPayload {
  name: string;
  code: string;
  sizeDm2: number;
  image: string;
  qrCode: string;
}

interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    filePath: string;
    fileUrl: string;
  };
}

export const uploadImage = async (file: File): Promise<UploadResponse> => {
  const token = Cookies.get('auth_token');

  if (!token) {
    return {
      success: false,
      message: 'Authentication tofileUrl: ',
      data: {
        filePath: '',
        fileUrl: '',
      },
    };
  }

  const formData = new FormData();
  formData.append('target', 'product');
  formData.append('image', file);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/upload`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const data = await response.json();
  return data as UploadResponse;
};

export const fetchProducts = async (
  page: number = 1,
  limit: number = 10,
  search: string = '',
  sort?: string
): Promise<FetchProductsResponse> => {
  const token = Cookies.get('auth_token');
  
  if (!token) {
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

  const sortParam = sort ? `&sort=${encodeURIComponent(sort)}` : '';

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/products?limit=${limit}&page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}${sortParam}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();
  return data as FetchProductsResponse;
};

export const fetchProductById = async (id: string): Promise<FetchProductResponse> => {
  const token = Cookies.get('auth_token');

  if (!token) {
    return {
      success: false,
      message: 'Authentication token missing',
      data: {} as ProductDataType,
    };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${id}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();
  return data as FetchProductResponse;
};

export const createProduct = async (productData: ProductPayload): Promise<CreateProductResponse> => {
  const token = Cookies.get('auth_token');

  if (!token) {
    return {
      success: false,
      message: 'Authentication token missing',
      data: {} as ProductDataType,
    };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/products`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    }
  );

  const data = await response.json();
  return data as CreateProductResponse;
};

export const updateProduct = async (id: string, productData: Partial<ProductPayload>): Promise<UpdateProductResponse> => {
  const token = Cookies.get('auth_token');

  if (!token) {
    return {
      success: false,
      message: 'Authentication token missing',
      data: {} as ProductDataType,
    };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    }
  );

  const data = await response.json();
  return data as UpdateProductResponse;
};

export const deleteProduct = async (id: string): Promise<{ success: boolean; message?: string }> => {
  const token = Cookies.get('auth_token');

  if (!token) {
    return {
      success: false,
      message: 'Authentication token missing',
    };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${id}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (response.ok) {
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return {
      success: true,
      message: data.message || 'Product deleted successfully',
    };
  } else {
    const data = await response.json();
    return {
      success: false,
      message: data.message || 'Failed to delete product',
    };
  }
};

interface DownloadResponse {
  success: boolean;
  message: string;
  data: {
    downloadUrl: string;
  };
}

export const downloadProductsExcel = async (): Promise<DownloadResponse> => {
  const token = Cookies.get('auth_token');

  if (!token) {
    return {
      success: false,
      message: 'Authentication token missing',
      data: { downloadUrl: '' },
    };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/download`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();
  return data as DownloadResponse;
}; 