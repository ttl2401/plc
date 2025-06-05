import { Request, Response, NextFunction } from 'express';
import { UserActivityService } from '@/services/user-activity.service';
import { returnMessage, returnPaginationMessage } from '@/controllers/base.controller';
import { ActivityAction, ActivityResource } from '@/models/user-activity.model';
import mongoose from 'mongoose';

const userActivityService = new UserActivityService();

// Get all activities with filtering
export const getActivities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, resource, action, userId } = req.query;

    const options = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      resource: resource as ActivityResource,
      action: action as ActivityAction,
      userId: userId ? new mongoose.Types.ObjectId(userId as string) : undefined,
    };

    const activities = await userActivityService.getAllActivities(options);
    return res.status(200).json(returnPaginationMessage(activities, 'Activities retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

// Get activities for current user
export const getMyActivities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, resource, action } = req.query;

    const options = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      resource: resource as ActivityResource,
      action: action as ActivityAction,
    };

    const activities = await userActivityService.getUserActivities(req.user._id, options);
    return res.status(200).json(returnPaginationMessage(activities, 'Your activities retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

// Get activities for a specific resource
export const getResourceActivities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { resource, resourceId } = req.params;
    const { page, limit, action } = req.query;

    const options = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      action: action as ActivityAction,
    };

    const activities = await userActivityService.getResourceActivities(
      resource as ActivityResource,
      new mongoose.Types.ObjectId(resourceId),
      options
    );
    return res.status(200).json(returnPaginationMessage(activities, 'Resource activities retrieved successfully'));
  } catch (error) {
    next(error);
  }
}; 