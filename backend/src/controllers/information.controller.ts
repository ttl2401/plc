import { Request, Response, NextFunction } from 'express';
import { ProductService } from '@/services/product.service';
import { TemperatureService } from '@/services/temperature.service';
import { TimerService } from '@/services/timer.service';
import { returnMessage, returnError, returnPaginationMessage } from '@/controllers/base.controller';
import { getSettingList } from '@/transforms/product.transform';
import exceljs from 'exceljs';
import dayjs from 'dayjs';

const productService = new ProductService();
const temperatureService = new TemperatureService();
const timerService = new TimerService();

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
    const { page = 1, limit = 10, line = 1, search = '' } = req.query;
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
    const { line = 1, search = '' } = req.query;
    // Get all products matching search and line (no limit)
    const result = await productService.getProductsWithSettings({
      page: 1,
      limit: 0, // 0 to get all data
      line: Number(line),
      search: search as string,
    });
    const codesArray = result.docs.map((product) => product.code);
    const data = await temperatureService.getInformationTemperature(codesArray);

    // Tank order and labels must match frontend
    const tankOrder = [
      "washing",
      "boiling_degreasing",
      "electro_degreasing",
      "pre_nickel_plating",
      "nickel_plating",
      "ultrasonic_hot_rinse",
      "hot_rinse",
      "dryer",
    ];
    const tankLabels: Record<string, string> = {
      washing: "Washing",
      boiling_degreasing: "Boiling Degreasing",
      electro_degreasing: "Electro Degreasing",
      pre_nickel_plating: "Pre-Nickel",
      nickel_plating: "Nickel Plating",
      ultrasonic_hot_rinse: "Ultrasonic",
      hot_rinse: "Hot rinse",
      dryer: "Dryer",
    };

    // Build columns: index, code, Ngày bắt đầu, Giờ vào, Giờ ra, then tanks
    const baseColumns = [
      { header: '#', key: 'id', width: 5 },
      { header: 'Mã sản phẩm', key: 'code', width: 20 },
      { header: 'Ngày bắt đầu', key: 'ngay_bat_dau', width: 15 },
      { header: 'Giờ vào', key: 'gio_vao', width: 12 },
      { header: 'Giờ ra', key: 'gio_ra', width: 12 },
    ];
    // Tank columns: each tank has children (oC, A, Slot as appropriate)
    const tankColumns = tankOrder.flatMap((tank) => {
      if (tank === 'electro_degreasing' || tank === 'nickel_plating') {
        return [
          { header: `${tankLabels[tank]} - oC`, key: `${tank}_temperature`, width: 10 },
          { header: `${tankLabels[tank]} - A`, key: `${tank}_ampere`, width: 10 },
          { header: `${tankLabels[tank]} - Slot`, key: `${tank}_slot`, width: 8 },
        ];
      } else if (tank === 'pre_nickel_plating') {
        return [
          { header: `${tankLabels[tank]} - oC`, key: `${tank}_temperature`, width: 10 },
          { header: `${tankLabels[tank]} - A`, key: `${tank}_ampere`, width: 10 },
        ];
      } else if (tank === 'dryer') {
        return [
          { header: `${tankLabels[tank]} - oC`, key: `${tank}_temperature`, width: 10 },
          { header: `${tankLabels[tank]} - Slot`, key: `${tank}_slot`, width: 8 },
        ];
      } else {
        return [
          { header: `${tankLabels[tank]} - oC`, key: `${tank}_temperature`, width: 10 },
        ];
      }
    });
    const worksheetColumns = [...baseColumns, ...tankColumns];

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Information Temperature');
    worksheet.columns = worksheetColumns;

    // Add rows
    data.forEach((item, idx) => {
      const firstTank = item.tanks[0];
      const lastTank = item.tanks[item.tanks.length - 1];
      const row: Record<string, any> = {
        id: idx + 1,
        code: item.code,
        ngay_bat_dau: firstTank ? dayjs.unix(firstTank.timeIn).format('DD-MM-YYYY') : '',
        gio_vao: firstTank ? dayjs.unix(firstTank.timeIn).format('HH:mm:ss') : '',
        gio_ra: lastTank ? dayjs.unix(lastTank.timeOut).format('HH:mm:ss') : '',
      };
      for (const tank of tankOrder) {
        const tankInfo = item.tanks.find((t: any) => t.name === tank) || {};
        if (tank === 'electro_degreasing' || tank === 'nickel_plating') {
          row[`${tank}_temperature`] = tankInfo.temperature ?? '-';
          row[`${tank}_ampere`] = tankInfo.ampere ?? '-';
          row[`${tank}_slot`] = tankInfo.slot ?? '-';
        } else if (tank === 'pre_nickel_plating') {
          row[`${tank}_temperature`] = tankInfo.temperature ?? '-';
          row[`${tank}_ampere`] = tankInfo.ampere ?? '-';
        } else if (tank === 'dryer') {
          row[`${tank}_temperature`] = tankInfo.temperature ?? '-';
          row[`${tank}_slot`] = tankInfo.slot ?? '-';
        } else {
          row[`${tank}_temperature`] = tankInfo.temperature ?? '-';
        }
      }
      worksheet.addRow(row);
    });

    // Set response headers for download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'information-temperature.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};



export const getInformationTimer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10, line = 1, search = '', from, to, tank } = req.query;

    let result;
    let codesArray: any[] = [];

    // Nếu có filter từ Influx
    if (from || to || tank) {
      // Convert from/to sang unix second nếu là string
      const fromNum = from ? Number(from) : undefined;
      const toNum = to ? Number(to) : undefined;

      // Lấy code và phân trang
      const influxResult = await timerService.getProductCodesFromInflux({
        from: fromNum,
        to: toNum,
        tank: typeof tank === 'string' ? tank : undefined,
        page: Number(page),
        limit: Number(limit),
        search: typeof search === 'string' ? search : undefined,
      });

      codesArray = influxResult.result;
      // Fake result docs để giữ nguyên logic trả về (docs, totalDocs, etc)
      result = {
        docs: codesArray, // sẽ map sang info tank ở dưới
        totalDocs: influxResult.total,
        totalPages: Math.ceil(influxResult.total / influxResult.limit),
        page: influxResult.page,
        limit: influxResult.limit,
        "pagingCounter": 1,
        "hasPrevPage": false,
        "hasNextPage": false,
        "prevPage": null,
        "nextPage": null
      };
    } else {
      // Lấy code từ Mongo như cũ (productService.getProductsWithSettings)
      result = await productService.getProductsWithSettings({
        page: Number(page),
        limit: Number(limit),
        search,
        line,
      });
      codesArray = result.docs.map((product) => product.code);
      const data = await timerService.getInformationTimer(codesArray);
      // Map kết quả vào docs
      result.docs = data;
    }

    
    return res.status(200).json(returnPaginationMessage(result, 'Fetched information timer successfully'));
  } catch (error) {
    return res.status(500).json(returnError(error as Error));
  }
};


export const downloadInformationTimer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { line = 1, search = '' } = req.query;
    // Get all products matching search and line (no limit)
    const result = await productService.getProductsWithSettings({
      page: 1,
      limit: 0, // 0 to get all data
      line: Number(line),
      search: search as string,
    });
    const codesArray = result.docs.map((product) => product.code);
    const data = await temperatureService.getInformationTemperature(codesArray);

    // Tank order and labels must match frontend
    const tankOrder = [
      "washing",
      "boiling_degreasing",
      "electro_degreasing",
      "pre_nickel_plating",
      "nickel_plating",
      "ultrasonic_hot_rinse",
      "hot_rinse",
      "dryer",
    ];
    const tankLabels: Record<string, string> = {
      washing: "Washing",
      boiling_degreasing: "Boiling Degreasing",
      electro_degreasing: "Electro Degreasing",
      pre_nickel_plating: "Pre-Nickel",
      nickel_plating: "Nickel Plating",
      ultrasonic_hot_rinse: "Ultrasonic",
      hot_rinse: "Hot rinse",
      dryer: "Dryer",
    };

    // Build columns: index, code, Ngày bắt đầu, Giờ vào, Giờ ra, then tanks
    const baseColumns = [
      { header: '#', key: 'id', width: 5 },
      { header: 'Mã sản phẩm', key: 'code', width: 20 },
      { header: 'Ngày bắt đầu', key: 'ngay_bat_dau', width: 15 },
      { header: 'Giờ vào', key: 'gio_vao', width: 12 },
      { header: 'Giờ ra', key: 'gio_ra', width: 12 },
    ];
    // Tank columns: each tank has children (oC, A, Slot as appropriate)
    const tankColumns = tankOrder.flatMap((tank) => {
      if (tank === 'electro_degreasing' || tank === 'nickel_plating') {
        return [
          { header: `${tankLabels[tank]} - oC`, key: `${tank}_temperature`, width: 10 },
          { header: `${tankLabels[tank]} - A`, key: `${tank}_ampere`, width: 10 },
          { header: `${tankLabels[tank]} - Slot`, key: `${tank}_slot`, width: 8 },
        ];
      } else if (tank === 'pre_nickel_plating') {
        return [
          { header: `${tankLabels[tank]} - oC`, key: `${tank}_temperature`, width: 10 },
          { header: `${tankLabels[tank]} - A`, key: `${tank}_ampere`, width: 10 },
        ];
      } else if (tank === 'dryer') {
        return [
          { header: `${tankLabels[tank]} - oC`, key: `${tank}_temperature`, width: 10 },
          { header: `${tankLabels[tank]} - Slot`, key: `${tank}_slot`, width: 8 },
        ];
      } else {
        return [
          { header: `${tankLabels[tank]} - oC`, key: `${tank}_temperature`, width: 10 },
        ];
      }
    });
    const worksheetColumns = [...baseColumns, ...tankColumns];

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Information Temperature');
    worksheet.columns = worksheetColumns;

    // Add rows
    data.forEach((item, idx) => {
      const firstTank = item.tanks[0];
      const lastTank = item.tanks[item.tanks.length - 1];
      const row: Record<string, any> = {
        id: idx + 1,
        code: item.code,
        ngay_bat_dau: firstTank ? dayjs.unix(firstTank.timeIn).format('DD-MM-YYYY') : '',
        gio_vao: firstTank ? dayjs.unix(firstTank.timeIn).format('HH:mm:ss') : '',
        gio_ra: lastTank ? dayjs.unix(lastTank.timeOut).format('HH:mm:ss') : '',
      };
      for (const tank of tankOrder) {
        const tankInfo = item.tanks.find((t: any) => t.name === tank) || {};
        if (tank === 'electro_degreasing' || tank === 'nickel_plating') {
          row[`${tank}_temperature`] = tankInfo.temperature ?? '-';
          row[`${tank}_ampere`] = tankInfo.ampere ?? '-';
          row[`${tank}_slot`] = tankInfo.slot ?? '-';
        } else if (tank === 'pre_nickel_plating') {
          row[`${tank}_temperature`] = tankInfo.temperature ?? '-';
          row[`${tank}_ampere`] = tankInfo.ampere ?? '-';
        } else if (tank === 'dryer') {
          row[`${tank}_temperature`] = tankInfo.temperature ?? '-';
          row[`${tank}_slot`] = tankInfo.slot ?? '-';
        } else {
          row[`${tank}_temperature`] = tankInfo.temperature ?? '-';
        }
      }
      worksheet.addRow(row);
    });

    // Set response headers for download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'information-temperature.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};