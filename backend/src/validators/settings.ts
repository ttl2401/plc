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

export const updateSettingRobotRules = [
  body('list')
    .isArray().withMessage('list phải là một array'),
  body('list.*._id')
    .optional({ nullable: true })
    .isString().withMessage('_id phải là string'),
  body('list.*.rackSettings')
    .optional({ nullable: true })
    .isObject().withMessage('rackSettings phải là object'),
  body('list.*.rackSettings.topDwellTime')
    .optional({ nullable: true })
    .isNumeric().withMessage('topDwellTime phải là số').bail()
    .custom((v) => v >= 0).withMessage('topDwellTime phải >= 0'),
  body('list.*.rackSettings.loweringWaitingTime')
    .optional({ nullable: true })
    .isNumeric().withMessage('loweringWaitingTime phải là số').bail()
    .custom((v) => v >= 0).withMessage('loweringWaitingTime phải >= 0'),
  body('list.*.rackSettings.bottomDwellTime')
    .optional({ nullable: true })
    .isNumeric().withMessage('bottomDwellTime phải là số').bail()
    .custom((v) => v >= 0).withMessage('bottomDwellTime phải >= 0'),
  body('list.*.barrelSettings')
    .optional({ nullable: true })
    .isObject().withMessage('barrelSettings phải là object'),
  body('list.*.barrelSettings.topDwellTime')
    .optional({ nullable: true })
    .isNumeric().withMessage('topDwellTime phải là số').bail()
    .custom((v) => v >= 0).withMessage('topDwellTime phải >= 0'),
  body('list.*.barrelSettings.loweringWaitingTime')
    .optional({ nullable: true })
    .isNumeric().withMessage('loweringWaitingTime phải là số').bail()
    .custom((v) => v >= 0).withMessage('loweringWaitingTime phải >= 0'),
  body('list.*.barrelSettings.bottomDwellTime')
    .optional({ nullable: true })
    .isNumeric().withMessage('bottomDwellTime phải là số').bail()
    .custom((v) => v >= 0).withMessage('bottomDwellTime phải >= 0'),
];