import { Request, Response, NextFunction } from 'express';
import { UserService } from '@/services/user.service';

const userService = new UserService();

// Create a new user
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!password || password.length < 6) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password must be at least 6 characters long',
      });
    }

    const user = await userService.createUser({ name, email, password, role });

    res.status(201).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Get all users
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await userService.getUsers();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single user
export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userService.getUserById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Update a user
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, role } = req.body;
    
    // If password is provided, validate it
    if (password && password.length < 6) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password must be at least 6 characters long',
      });
    }

    const user = await userService.updateUser(req.params.id, {
      name,
      email,
      password,
      role,
    });

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a user
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await userService.deleteUser(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
}; 