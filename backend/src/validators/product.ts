import { body } from 'express-validator';
import { productPlatingModes } from '@/config/constant';
const enumProductPlatingMode = productPlatingModes.map(item => item.key);

export const updateSettingPlatingRules = [
  body('settings')
    .isObject().withMessage('Settings phải là một object'),

  body('settings.line')
    .isInt({ min: 1 }).withMessage('Line phải là số nguyên lớn hơn 0'),

  body('settings.mode')
    .isString().withMessage('Mode phải là một chuỗi')
    .notEmpty().withMessage('Mode không được để trống')
    .isIn(enumProductPlatingMode).withMessage(`Mode phải thuộc (${enumProductPlatingMode.join(', ')})`),

]; 