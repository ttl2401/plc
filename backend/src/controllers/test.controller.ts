import { Request, Response, NextFunction } from 'express';
import { User } from '@/models/user.model';
import { AppError } from '@/middleware/error.middleware';

export const testUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Create a test user if it doesn't exist
    const testUser = await User.findOneAndUpdate(
      { email: 'test@example.com' },
      {
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      },
      { upsert: true, new: true }
    );

    if (!testUser) {
      return next(new AppError('Failed to create test user', 500));
    }

    res.status(200).json({
      status: 'success',
      data: testUser,
    });
  } catch (error) {
    next(error);
  }
}; 