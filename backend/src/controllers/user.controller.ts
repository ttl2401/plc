import { Request, Response, NextFunction } from 'express';
import { UserService } from '@/services/user.service';
import { returnMessage, returnError, returnPaginationMessage } from '@/controllers/base.controller';


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
      return res.status(400).json(returnError('Password must be at least 6 characters long'));
    }

    const user = await userService.createUser({ name, email, password, role });

    return res.status(201).json(returnMessage(user, 'User created successfully'));
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
    const query = req.query;
    const result = await userService.getUsers(query);

    return res.status(200).json(returnPaginationMessage(result as any, 'Users retrieved successfully'));
    
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

    return res.status(200).json(returnMessage(user, 'User retrieved successfully'));
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
      return res.status(400).json(returnError('Password must be at least 6 characters long'));
    }

    const user = await userService.updateUser(req.params.id, {
      name,
      email,
      password,
      role,
    });

    return res.status(200).json(returnMessage(user, 'User updated successfully'));
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

    return res.status(204).json(returnMessage(null, 'User deleted successfully'));
  } catch (error) {
    next(error);
  }
};

// Get current user profile
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // User is already attached to req by auth middleware
    const user = req.user;
    return res.status(200).json(returnMessage(user, 'Profile retrieved successfully'));
  } catch (error) {
    next(error);
  }
}; 