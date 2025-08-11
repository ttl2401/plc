import { body } from 'express-validator';

export const updatePLCVariablesRules = [
    body('variables')
    .isArray().withMessage('list must be array'),
    body('list.*.name')
        .isString().withMessage('name must be string'),
    body('list.*.value')
        .notEmpty().withMessage('value must not be empty')
]; 