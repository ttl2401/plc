import { Request, Response, NextFunction } from 'express';
import { UserService } from '@/services/user.service';
import { UserActivityService } from '@/services/user-activity.service';
import { returnMessage, returnError, returnPaginationMessage } from '@/controllers/base.controller';
import { ActivityAction, ActivityResource } from '@/models/user-activity.model';
import mongoose from 'mongoose';
import { IUser } from '@/models/user.model';

const userService = new UserService();
const userActivityService = new UserActivityService();

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

    const user = await userService.createUser({ name, email, password, role }) as IUser;

    // Log the activity
    await userActivityService.logActivity(
      new mongoose.Types.ObjectId(String(req.user._id)),
      ActivityAction.CREATE,
      ActivityResource.USER,
      new mongoose.Types.ObjectId(String(user._id)),
      { after: user },
      req
    );

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

    // Get the user before update
    const beforeUser = await userService.getUserById(req.params.id) as IUser;

    const user = await userService.updateUser(req.params.id, {
      name,
      email,
      password,
      role,
    }) as IUser;

    // Log the activity
    await userActivityService.logActivity(
      new mongoose.Types.ObjectId(String(req.user._id)),
      ActivityAction.UPDATE,
      ActivityResource.USER,
      new mongoose.Types.ObjectId(String(user._id)),
      {
        before: beforeUser,
        after: user,
        changes: { name, email, role }, // Don't log password changes
      },
      req
    );

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
    // Get the user before deletion
    const beforeUser = await userService.getUserById(req.params.id) as IUser;

    await userService.deleteUser(req.params.id);

    // Log the activity
    await userActivityService.logActivity(
      new mongoose.Types.ObjectId(String(req.user._id)),
      ActivityAction.DELETE,
      ActivityResource.USER,
      new mongoose.Types.ObjectId(String(beforeUser._id)),
      { before: beforeUser },
      req
    );

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