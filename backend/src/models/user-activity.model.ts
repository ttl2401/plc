import mongoose, { Document, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// Define the types of actions that can be logged
export enum ActivityAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

// Define the types of resources that can be logged
export enum ActivityResource {
  USER = 'user',
  PRODUCT = 'product',
  PRODUCT_SETTING = 'product_setting',
  CATEGORY = 'category',
  // Add more resources as needed
}

export interface IUserActivity extends Document {
  user: mongoose.Types.ObjectId;  // The user who performed the action
  action: ActivityAction;         // The type of action (create, update, delete)
  resource: ActivityResource;     // The type of resource affected
  resourceId: mongoose.Types.ObjectId;  // The ID of the affected resource
  details: {
    before?: any;    // The state before the action (for update/delete)
    after?: any;     // The state after the action (for create/update)
    changes?: any;   // Specific changes made (for update)
  };
  ipAddress?: string;  // IP address of the user
  userAgent?: string;  // User agent (browser/device info)
  createdAt: Date;
  updatedAt: Date;
}

const userActivitySchema = new Schema<IUserActivity>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: Object.values(ActivityAction),
      required: true,
    },
    resource: {
      type: String,
      enum: Object.values(ActivityResource),
      required: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    details: {
      before: Schema.Types.Mixed,
      after: Schema.Types.Mixed,
      changes: Schema.Types.Mixed,
    },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
    collection: 'UserActivities'
  }
);

// Add pagination plugin
userActivitySchema.plugin(mongoosePaginate);

// Index for faster queries
userActivitySchema.index({ user: 1, createdAt: -1 });
userActivitySchema.index({ resource: 1, resourceId: 1 });
userActivitySchema.index({ action: 1, createdAt: -1 });

export const UserActivity = mongoose.model<IUserActivity, mongoose.PaginateModel<IUserActivity>>('UserActivity', userActivitySchema); 