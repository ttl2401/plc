import { Request, Response, NextFunction } from 'express';
import { HistoryOperatingService } from '@/services/history-operating.service';
import { HistoryChemicalAdditionService } from '@/services/history-chemical-addition.service';
import { HistoryWaterAdditionService } from '@/services/history-water-addition.service';

import { returnPaginationMessage, returnError } from '@/controllers/base.controller';
import exceljs from 'exceljs';

const historyOperatingService = new HistoryOperatingService();
const historyChemicalAdditionService = new HistoryChemicalAdditionService();
const historyWaterAdditionService = new HistoryWaterAdditionService();

// Get all history operating (paginated)
export const getHistoryOperating = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query;
    const data = await historyOperatingService.getHistoryOperations(query);
    return res.status(200).json(returnPaginationMessage(data, 'History operations retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

// Download history operating as Excel file
export const downloadHistoryOperating = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const histories = await historyOperatingService.getAllHistoryOperationsSorted();
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('HistoryOperating');

    worksheet.columns = [
      { header: '#', key: 'id', width: 5 },
      { header: 'Action', key: 'action', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Started At', key: 'startedAt', width: 25 },
      { header: 'Ended At', key: 'endedAt', width: 25 },
      { header: 'Created At', key: 'createdAt', width: 25 },
      { header: 'Updated At', key: 'updatedAt', width: 25 },
    ];

    histories.forEach((history, index) => {
      worksheet.addRow({
        id: index + 1,
        action: history.action,
        date: history.date,
        startedAt: history.startedAt ? new Date(history.startedAt).toLocaleString() : '',
        endedAt: history.endedAt ? new Date(history.endedAt).toLocaleString() : '',
        createdAt: history.createdAt ? new Date(history.createdAt).toLocaleString() : '',
        updatedAt: history.updatedAt ? new Date(history.updatedAt).toLocaleString() : '',
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=history-operating.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
}; 


// Get all history chemical additions (paginated)
export const getHistoryChemicalAddition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query;
    const data = await historyChemicalAdditionService.getHistoryChemicalAdditions(query);
    return res.status(200).json(returnPaginationMessage(data, 'History chemical additions retrieved successfully'));
  } catch (error) {
    next(error);
  }
};


// Download history chemical additions as Excel file
export const downloadHistoryChemicalAddition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const histories = await historyChemicalAdditionService.getAllHistoryChemicalAdditionsSorted();
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('HistoryChemicalAddition');

    worksheet.columns = [
      { header: '#', key: 'id', width: 5 },
      { header: 'Action', key: 'action', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Pumps', key: 'pumps', width: 40 },
      { header: 'Ampere Consumption', key: 'ampereConsumption', width: 20 },
      { header: 'Created At', key: 'createdAt', width: 25 },
      { header: 'Updated At', key: 'updatedAt', width: 25 },
    ];

    histories.forEach((history, index) => {
      worksheet.addRow({
        id: index + 1,
        action: history.action,
        date: history.date,
        pumps: history.pumps && Array.isArray(history.pumps)
          ? history.pumps.map(p => `Start: ${p.startedAt ? new Date(p.startedAt).toLocaleString() : ''}, End: ${p.endedAt ? new Date(p.endedAt).toLocaleString() : ''}`).join('; ')
          : '',
        ampereConsumption: history.ampereConsumption || '',
        createdAt: history.createdAt ? new Date(history.createdAt).toLocaleString() : '',
        updatedAt: history.updatedAt ? new Date(history.updatedAt).toLocaleString() : '',
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=history-chemical-addition.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
}; 

// Get all history water additions (paginated)
export const getHistoryWaterAddition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query;
    const data = await historyWaterAdditionService.getHistoryWaterAdditions(query);
    return res.status(200).json(returnPaginationMessage(data, 'History water additions retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

// Download history water additions as Excel file
export const downloadHistoryWaterAddition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const histories = await historyWaterAdditionService.getAllHistoryWaterAdditionsSorted();
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('HistoryWaterAddition');

    worksheet.columns = [
      { header: '#', key: 'id', width: 5 },
      { header: 'Action', key: 'action', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Started At', key: 'startedAt', width: 25 },
      { header: 'Ended At', key: 'endedAt', width: 25 },
      { header: 'Created At', key: 'createdAt', width: 25 },
      { header: 'Updated At', key: 'updatedAt', width: 25 },
    ];

    histories.forEach((history, index) => {
      worksheet.addRow({
        id: index + 1,
        action: history.action,
        date: history.date,
        startedAt: history.startedAt ? new Date(history.startedAt).toLocaleString() : '',
        endedAt: history.endedAt ? new Date(history.endedAt).toLocaleString() : '',
        createdAt: history.createdAt ? new Date(history.createdAt).toLocaleString() : '',
        updatedAt: history.updatedAt ? new Date(history.updatedAt).toLocaleString() : '',
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=history-water-addition.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
}; 