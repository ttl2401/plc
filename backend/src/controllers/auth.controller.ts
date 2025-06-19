import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@/models/user.model';
import { AppError } from '@/middlewares/error.middleware';
import { JWT } from '@/config';
import ms from 'ms';
import { returnMessage } from './base.controller';

// Login user
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT.SECRET as string,
      {
        expiresIn: JWT.EXPIRES_IN as ms.StringValue | number,
      }
    );

    // Remove password from output
    const userWithoutPassword = user.toObject();
    const { password: _, ...userData } = userWithoutPassword;

    return res.status(200).json(returnMessage({ user: userData, token }, 'Login successful'));
  } catch (error) {
    next(error);
  }
};

// Logout user
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Since we're using JWT, we don't need to do anything server-side
    // The client should remove the token from storage
    return res.status(200).json(returnMessage(null, 'Logged out successfully'));
  } catch (error) {
    next(error);
  }
}; 