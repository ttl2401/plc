import { UserActivity, ActivityAction, ActivityResource, IUserActivity } from '@/models/user-activity.model';
import { Request } from 'express';
import mongoose from 'mongoose';
import { PaginateResult } from '@/controllers/base.controller';

export class UserActivityService {
  /**
   * Log a user activity
   */
  async logActivity(
    userId: mongoose.Types.ObjectId,
    action: ActivityAction,
    resource: ActivityResource,
    resourceId: mongoose.Types.ObjectId,
    details: {
      before?: any;
      after?: any;
      changes?: any;
    },
    req?: Request
  ): Promise<IUserActivity> {
    const activity = await UserActivity.create({
      user: userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress: req?.ip,
      userAgent: req?.headers['user-agent'],
    });

    return activity;
  }

  /**
   * Get activities for a specific user
   */
  async getUserActivities(
    userId: mongoose.Types.ObjectId,
    options: {
      page?: number;
      limit?: number;
      resource?: ActivityResource;
      action?: ActivityAction;
    } = {}
  ) {
    const { page = 1, limit = 10, resource, action } = options;

    const query: any = { user: userId };
    if (resource) query.resource = resource;
    if (action) query.action = action;

    return await UserActivity.paginate(query, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: 'user',
    }) as PaginateResult<IUserActivity>;
  }

  /**
   * Get activities for a specific resource
   */
  async getResourceActivities(
    resource: ActivityResource,
    resourceId: mongoose.Types.ObjectId,
    options: {
      page?: number;
      limit?: number;
      action?: ActivityAction;
    } = {}
  ) {
    const { page = 1, limit = 10, action } = options;

    const query: any = { resource, resourceId };
    if (action) query.action = action;

    return await UserActivity.paginate(query, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: 'user',
    }) as PaginateResult<IUserActivity>;
  }

  /**
   * Get all activities with filtering
   */
  async getAllActivities(options: {
    page?: number;
    limit?: number;
    resource?: ActivityResource;
    action?: ActivityAction;
    userId?: mongoose.Types.ObjectId;
  } = {}) {
    const { page = 1, limit = 10, resource, action, userId } = options;

    const query: any = {};
    if (resource) query.resource = resource;
    if (action) query.action = action;
    if (userId) query.user = userId;

    return await UserActivity.paginate(query, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: 'user',
    }) as PaginateResult<IUserActivity>;
  }
} 