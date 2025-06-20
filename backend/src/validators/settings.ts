import { body } from 'express-validator';

export const updateSettingTimerRules = [
  body('list')
    .isArray().withMessage('list phải là một array'),
  body('list.*._id')
    .isString().withMessage('tankId phải là string'),
  body('list.*.timer')
    .isNumeric().withMessage('timer phải là số')
];

export const updateSettingTemperatureRules = [
    body('list')
      .isArray().withMessage('list phải là một array'),
    body('list.*._id')
      .isString().withMessage('_id phải là string'),
    body('list.*.temp')
      .isNumeric().withMessage('temp phải là số')
  ];