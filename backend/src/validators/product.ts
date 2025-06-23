import { body } from 'express-validator';

export const updateSettingPlatingRules = [
  body('settings')
    .isObject().withMessage('Settings phải là một object'),

  body('settings.line')
    .isInt({ min: 1 }).withMessage('Line phải là số nguyên lớn hơn 0'),

  body('settings.rackPlating')
    .isObject().withMessage('rackPlating phải là một object'),
  body('settings.rackPlating.tankAndGroups')
    .isArray().withMessage('tankAndGroups của rackPlating phải là một array'),

  body('settings.barrelPlating')
    .isObject().withMessage('barrelPlating phải là một object'),
  body('settings.barrelPlating.tankAndGroups')
    .isArray().withMessage('tankAndGroups của barrelPlating phải là một array'),
]; 