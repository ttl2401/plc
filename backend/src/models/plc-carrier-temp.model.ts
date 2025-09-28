import mongoose, { Document, Schema } from 'mongoose';

export interface IPlcCarrierTemp extends Document {
  robotId: number;
  robotKey: string;
  carrierPick: number;
  productCode: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;
}

const plcCarrierTempSchema = new Schema<IPlcCarrierTemp>(
  {
    robotId: {
      type: Number,
      required: true,
      trim: true,
    },
    robotKey: {
        type: String,
        required: true,
    },
    carrierPick: {
        type: Number,
        required: true
    },
    productCode: {
        type: String,
        required: true,
    },
    action: {
        type: String,
        required: true,
        enum: ['enter', 'exit'],
    }
  },
  {
    timestamps: true,
    collection: 'PlcCarrierTemp',
  }
);

// Index for faster queries on name and key
plcCarrierTempSchema.index({ robotId: 1 });
plcCarrierTempSchema.index({ robotKey: 1 });
plcCarrierTempSchema.index({ productCode: 1 });
plcCarrierTempSchema.index({ action: 1 });

export const PlcCarrierTemp = mongoose.model<IPlcCarrierTemp>('PlcCarrierTemp', plcCarrierTempSchema); 