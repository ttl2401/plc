import { Request, Response, NextFunction } from 'express';
import { ProductService } from '@/services/product.service';
import { TemperatureService } from '@/services/temperature.service';
import { returnMessage, returnError, returnPaginationMessage } from '@/controllers/base.controller';
import { getSettingList } from '@/transforms/product.transform';
import exceljs from 'exceljs';

const productService = new ProductService();
const temperatureService = new TemperatureService();

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

// Download plating information as an Excel file
export const downloadInformationPlating = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { line = 1, mode, limit = 0 } = req.query;
    
    // Get all products with settings (no pagination for download)
    const result = await productService.getProductsWithSettings({
      page: 1,
      limit: Number(limit), // 0 to get all data
      line: Number(line),
      mode: mode as string
    });

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Plating Information');

    // Define tank names (order matters)
    const tankNames = [
      'Hồ Electron Degreasing 1',
      'Hồ Electron Degreasing 2',
      'Hồ Pre-Nickel Plating',
      'Hồ Nickel Plating',
    ];

    // Build columns: base columns + tank columns (each tank: Dòng điện, Dòng tổng, T1, T2)
    const baseColumns = [
      { header: '#', key: 'id', width: 5 },
      { header: 'Mã sản phẩm', key: 'code', width: 20 },
      { header: 'Tên sản phẩm', key: 'name', width: 30 },
      { header: 'Kích thước (dm²)', key: 'sizeDm2', width: 20 },
      { header: 'Chế độ', key: 'mode', width: 10 },
      { header: 'Jig/Carrier (Kg/Barrel)', key: 'jigCarrier', width: 15 },
      { header: 'Pcs/Jig', key: 'pcsJig', width: 10 },
    ];
    const tankColumns = tankNames.flatMap((tank, idx) => [
      { header: `${tank} - Dòng điện`, key: `currentJig_${idx}`, width: 12 },
      { header: `${tank} - Dòng tổng`, key: `currentTotal_${idx}`, width: 12 },
      { header: `${tank} - T1`, key: `T1_${idx}`, width: 8 },
      { header: `${tank} - T2`, key: `T2_${idx}`, width: 8 },
    ]);
    const endColumns = [
      { header: 'Ngày tạo', key: 'createdAt', width: 20 },
      { header: 'Ngày cập nhật', key: 'updatedAt', width: 20 },
    ];
    worksheet.columns = [...baseColumns, ...tankColumns, ...endColumns];

    // Add rows
    result.docs.forEach((product, index) => {
      const productData = product.toObject();
      const settings = productData.settings || [];
      // Find the relevant setting based on line and mode
      const relevantSetting = settings.find((setting: any) => 
        setting.line === Number(line) && (!mode || setting.mode === mode)
      );
      let modeValue = relevantSetting?.mode || '';
      let jigCarrier = '';
      let pcsJig = '';
      let tankAndGroups: any[] = [];
      if (modeValue === 'rack' && relevantSetting?.rackPlating) {
        jigCarrier = relevantSetting.rackPlating.jigCarrier;
        pcsJig = relevantSetting.rackPlating.pcsJig;
        tankAndGroups = relevantSetting.rackPlating.tankAndGroups || [];
      } else if (modeValue === 'barrel' && relevantSetting?.barrelPlating) {
        jigCarrier = relevantSetting.barrelPlating.kgBarrel;
        pcsJig = 'N/A';
        tankAndGroups = relevantSetting.barrelPlating.tankAndGroups || [];
      }
      // Build tank values for each tank
      const tankValues: Record<string, any> = {};
      for (let i = 0; i < tankNames.length; i++) {
        const tank = tankAndGroups[i] || {};
        tankValues[`currentJig_${i}`] = modeValue === 'rack' ? (tank.currentJig ?? 'N/A') : 'N/A';
        tankValues[`currentTotal_${i}`] = tank.currentTotal ?? 'N/A';
        tankValues[`T1_${i}`] = tank.T1 ?? 'N/A';
        tankValues[`T2_${i}`] = tank.T2 ?? 'N/A';
      }
      worksheet.addRow({
        id: index + 1,
        code: productData.code,
        name: productData.name,
        sizeDm2: productData.sizeDm2,
        mode: modeValue === 'rack' ? 'Treo' : modeValue === 'barrel' ? 'Quay' : '',
        jigCarrier,
        pcsJig,
        ...tankValues,
        createdAt: productData.createdAt ? new Date(productData.createdAt).toLocaleString() : '',
        updatedAt: productData.updatedAt ? new Date(productData.updatedAt).toLocaleString() : '',
      });
    });

    // Set response headers for download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'plating-information.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

export const getInformationTemperature = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10, line = 1, search = '', time } = req.query;
    const result = await productService.getProductsWithSettings({
      page: Number(page),
      limit: Number(limit),
      search,
      line
    });
    const codesArray = result.docs.map((product) => product.code);
    const data = await temperatureService.getInformationTemperature(codesArray);

    result.docs = data;
    return res.status(200).json(returnPaginationMessage(result, 'Fetched information temperature successfully'));
  } catch (error) {
    return res.status(500).json(returnError(error as Error));
  }
};

export const downloadInformationTemperature = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { line = 1, mode, limit = 0 } = req.query;
    
    // Get all products with settings (no pagination for download)
    const result = await productService.getProductsWithSettings({
      page: 1,
      limit: Number(limit), // 0 to get all data
      line: Number(line),
      mode: mode as string
    });

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Plating Information');

    // Define tank names (order matters)
    const tankNames = [
      'Hồ Electron Degreasing 1',
      'Hồ Electron Degreasing 2',
      'Hồ Pre-Nickel Plating',
      'Hồ Nickel Plating',
    ];

    // Build columns: base columns + tank columns (each tank: Dòng điện, Dòng tổng, T1, T2)
    const baseColumns = [
      { header: '#', key: 'id', width: 5 },
      { header: 'Mã sản phẩm', key: 'code', width: 20 },
      { header: 'Tên sản phẩm', key: 'name', width: 30 },
      { header: 'Kích thước (dm²)', key: 'sizeDm2', width: 20 },
      { header: 'Chế độ', key: 'mode', width: 10 },
      { header: 'Jig/Carrier (Kg/Barrel)', key: 'jigCarrier', width: 15 },
      { header: 'Pcs/Jig', key: 'pcsJig', width: 10 },
    ];
    const tankColumns = tankNames.flatMap((tank, idx) => [
      { header: `${tank} - Dòng điện`, key: `currentJig_${idx}`, width: 12 },
      { header: `${tank} - Dòng tổng`, key: `currentTotal_${idx}`, width: 12 },
      { header: `${tank} - T1`, key: `T1_${idx}`, width: 8 },
      { header: `${tank} - T2`, key: `T2_${idx}`, width: 8 },
    ]);
    const endColumns = [
      { header: 'Ngày tạo', key: 'createdAt', width: 20 },
      { header: 'Ngày cập nhật', key: 'updatedAt', width: 20 },
    ];
    worksheet.columns = [...baseColumns, ...tankColumns, ...endColumns];

    // Add rows
    result.docs.forEach((product, index) => {
      const productData = product.toObject();
      const settings = productData.settings || [];
      // Find the relevant setting based on line and mode
      const relevantSetting = settings.find((setting: any) => 
        setting.line === Number(line) && (!mode || setting.mode === mode)
      );
      let modeValue = relevantSetting?.mode || '';
      let jigCarrier = '';
      let pcsJig = '';
      let tankAndGroups: any[] = [];
      if (modeValue === 'rack' && relevantSetting?.rackPlating) {
        jigCarrier = relevantSetting.rackPlating.jigCarrier;
        pcsJig = relevantSetting.rackPlating.pcsJig;
        tankAndGroups = relevantSetting.rackPlating.tankAndGroups || [];
      } else if (modeValue === 'barrel' && relevantSetting?.barrelPlating) {
        jigCarrier = relevantSetting.barrelPlating.kgBarrel;
        pcsJig = 'N/A';
        tankAndGroups = relevantSetting.barrelPlating.tankAndGroups || [];
      }
      // Build tank values for each tank
      const tankValues: Record<string, any> = {};
      for (let i = 0; i < tankNames.length; i++) {
        const tank = tankAndGroups[i] || {};
        tankValues[`currentJig_${i}`] = modeValue === 'rack' ? (tank.currentJig ?? 'N/A') : 'N/A';
        tankValues[`currentTotal_${i}`] = tank.currentTotal ?? 'N/A';
        tankValues[`T1_${i}`] = tank.T1 ?? 'N/A';
        tankValues[`T2_${i}`] = tank.T2 ?? 'N/A';
      }
      worksheet.addRow({
        id: index + 1,
        code: productData.code,
        name: productData.name,
        sizeDm2: productData.sizeDm2,
        mode: modeValue === 'rack' ? 'Treo' : modeValue === 'barrel' ? 'Quay' : '',
        jigCarrier,
        pcsJig,
        ...tankValues,
        createdAt: productData.createdAt ? new Date(productData.createdAt).toLocaleString() : '',
        updatedAt: productData.updatedAt ? new Date(productData.updatedAt).toLocaleString() : '',
      });
    });

    // Set response headers for download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'plating-information.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};