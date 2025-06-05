import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';


// Type for the roles parameter
type RoleType = string;

/**
 * Middleware to restrict access based on user roles
 * @param roles - Single role or array of roles that are allowed to access the route
 */
export const restrictTo = (...roles: RoleType[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user exists (should be set by auth middleware)
    if (!req.user) {
      return next(new AppError('You are not logged in', 401));
    }

    // Flatten roles array if nested
    const allowedRoles = roles.flat();

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
}; 