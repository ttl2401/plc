import mongoose, { Document, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { TankGroup } from './tank-group.model';

export interface ITank extends Document {
  groupKey: string;
  name: string;
  key: string;
  settings?: {
    temp?: number | null;
    chemistry?: {
      AHToAdded: number;
      pumps: Array<{
        pumpKey: string;
        pumpType: string;
        pumpName: string;
        time: number;
      }>;
    } | null;
  } | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  group?: any; // Virtual field for populated TankGroup
}

const chemistryPumpSchema = new Schema({
  pumpKey: { type: String, required: true },
  pumpType: { type: String, required: true },
  pumpName: { type: String, required: true },
  time: { type: Number, required: true }
}, { _id: false });

const chemistrySchema = new Schema({
  AHToAdded: { type: Number, min: 0, default: 0 },
  pumps: { type: [chemistryPumpSchema], default: [] }
}, { _id: false });

const settingsSchema = new Schema({
  temp: { type: Number, default: null },
  chemistry: { type: chemistrySchema, default: null }
}, { _id: false });


const tankSchema = new Schema<ITank>(
  {
    groupKey: {
      type: String,
      required: true,
    },
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
    settings: { type: settingsSchema, default: null },
    active: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
    collection: 'Tanks',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate for TankGroup
tankSchema.virtual('group', {
  ref: TankGroup,
  localField: 'groupKey',
  foreignField: 'key',
  justOne: true
});

// Add pagination plugin
tankSchema.plugin(mongoosePaginate);

// Indexes for faster queries
tankSchema.index({ name: 1 });
tankSchema.index({ groupKey: 1 });
tankSchema.index({ key: 1 }, { unique: true });

// Compound index for groupKey and key
tankSchema.index({ groupKey: 1, key: 1 });

export const Tank = mongoose.model<ITank, mongoose.PaginateModel<ITank>>('Tank', tankSchema); 