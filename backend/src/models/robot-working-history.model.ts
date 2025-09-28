import mongoose, { Document, Schema } from 'mongoose';

export interface IRobotWorkingHistory extends Document {
  robotKey: string;
  carrierPick: number;
  tankId: number;
  tankKey: string;
  action: string;
  productCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const robotWorkingHistorySchema = new Schema<IRobotWorkingHistory>(
  {
    robotKey: {
      type: String,
      required: true,
      trim: true,
    },
    carrierPick: {
      type: Number,
      required: true,
      trim: true,
    },
    tankId: {
        type: Number,
        required: true,
    },
    tankKey: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['enter', 'exit'],
    },
    productCode: {
      type: String,
      required: false,
    }
  },
  {
    timestamps: true,
    collection: 'RobotWorkingHistory',
  }
);

// Index for faster queries 
robotWorkingHistorySchema.index({ robotKey: 1 });
robotWorkingHistorySchema.index({ productCode: 1 });

export const RobotWorkingHistory = mongoose.model<IRobotWorkingHistory>('RobotWorkingHistory', robotWorkingHistorySchema); 