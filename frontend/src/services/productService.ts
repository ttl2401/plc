import Cookies from 'js-cookie';
import { authenticatedFetch, handleUnauthorized } from '../utils/api';

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

interface MassUploadResponse {
  success: boolean;
  message: string;
  data: {
    result: [string];
  };
}
export const massUploadProduct = async (file: File): Promise<MassUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();
  return data as MassUploadResponse;
};



export const fetchProducts = async (
  page: number = 1,
  limit: number = 10,
  search: string = '',
  sort?: string
): Promise<FetchProductsResponse> => {
  
  const sortParam = sort ? `&sort=${encodeURIComponent(sort)}` : '';

  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/products?limit=${limit}&page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}${sortParam}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();
  return data as FetchProductsResponse;
};

export const fetchProductById = async (id: string): Promise<FetchProductResponse> => {
  
  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${id}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();
  return data as FetchProductResponse;
};

export const createProduct = async (productData: ProductPayload): Promise<CreateProductResponse> => {

  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/products`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    }
  );

  const data = await response.json();
  return data as CreateProductResponse;
};

export const updateProduct = async (id: string, productData: Partial<ProductPayload>): Promise<UpdateProductResponse> => {
  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    }
  );

  const data = await response.json();
  return data as UpdateProductResponse;
};

export const deleteProduct = async (id: string): Promise<{ success: boolean; message?: string }> => {
  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${id}`,
    {
      method: 'DELETE',
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
}

export const downloadProductsExcel = async (): Promise<DownloadResponse> => {
  try {
    const response = await authenticatedFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/download`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to download Excel file');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    return {
      success: true,
      message: 'Excel file downloaded successfully!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to download Excel file.',
    };
  }
};

export interface ProductChange {
  _id: string;
  field: string;
  oldValue: string;
  newValue: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface FetchProductChangesResponse {
  success: boolean;
  message: string;
  data: ProductChange[];
}

export const fetchProductChanges = async (productId: string): Promise<FetchProductChangesResponse> => {
  const response = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${productId}/changes`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();
  return data as FetchProductChangesResponse;
};
