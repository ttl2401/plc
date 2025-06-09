import { IProduct } from '@/models/product.model';
import { API_URL } from '@/config';
import { PaginateResult } from '@/controllers/base.controller';

export const getList = (data: PaginateResult<IProduct>) => {
  const products = data.docs.map(product => ({
    ...product.toObject(),
    imageUrl: product.image ? `${API_URL}/${product.image}` : '',
  }));
  return { ...data, docs: products };
};

export const getDetail = (data: IProduct) => {
    const product = data.toObject();
    const image =product.image || '';
    const imageUrl = image  ? `${API_URL}/${image}` : ''
    return { ...product, ...{image, imageUrl} };
  };
  