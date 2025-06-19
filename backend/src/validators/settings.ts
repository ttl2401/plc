import { body } from 'express-validator';

export const updateSettingTimerRules = [
  body('list')
    .isArray().withMessage('list phải là một array'),
  body('list.*.tankGroupId')
    .isString().withMessage('tankId phải là string'),
  body('list.*.timer')
    .isNumeric().withMessage('timer phải là số')
];