import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware';
import { JWT } from '@/config';
import { UserService } from '@/services/user.service';

const userService = new UserService();

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1) Get token from header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in', 401));
    }

    // 2) Verify token
    const decoded = jwt.verify(token, JWT.SECRET) as { id: string };

    // 3) Check if user still exists
    const user = await userService.getUserById(decoded.id);
    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    // 4) Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Invalid token', 401));
  }
}; 