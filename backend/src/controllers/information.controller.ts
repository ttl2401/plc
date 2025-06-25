import { Request, Response, NextFunction } from 'express';
import { ProductService } from '@/services/product.service';
import { returnMessage, returnError, returnPaginationMessage } from '@/controllers/base.controller';
import { getSettingList } from '@/transforms/product.transform';

const productService = new ProductService();

export const getInformationPlating = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10, line = 1, search = '', mode } = req.query;
    const result = await productService.getProductsWithSettings({
      page: Number(page),
      limit: Number(limit),
      search,
      line,
      mode
    });
    const data = getSettingList(result)
    return res.status(200).json(returnPaginationMessage(data, 'Fetched all products with settings successfully'));
  } catch (error) {
    return res.status(500).json(returnError(error as Error));
  }
};
