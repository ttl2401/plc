import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';

// middleware validate with rules
function validate(rules: ValidationChain[]) {
  return [
    ...rules,
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ];
}

export default validate;
