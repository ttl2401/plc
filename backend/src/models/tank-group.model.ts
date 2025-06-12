import mongoose, { Document, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface ITankGroup extends Document {
  name: string;
  key: string;
  setting?: {
    timer: string;
  } | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const tankGroupSchema = new Schema<ITankGroup>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
    },
    setting: {
      type: {
        timer: String
      },
      default: null
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'TankGroups'
  }
);

// Add pagination plugin
tankGroupSchema.plugin(mongoosePaginate);

// Index for faster queries on name
tankGroupSchema.index({ name: 1 });

export const TankGroup = mongoose.model<ITankGroup, mongoose.PaginateModel<ITankGroup>>('TankGroup', tankGroupSchema); 