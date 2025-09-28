/**
 * Store value of configuration , like carrier value (increment), current loading position ...
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IPlcVariableConfig extends Document {
  key: string;
  value: any;
  createdAt: Date;
  updatedAt: Date;
}

const plcVariableConfigSchema = new Schema<IPlcVariableConfig>(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: false,
        default: null

    }
  },
  {
    timestamps: true,
    collection: 'PlcVariableConfig',
  }
);

// Index for faster queries on name and key
plcVariableConfigSchema.index({ key: 1 });
plcVariableConfigSchema.index({ value: 1 });

export const PlcVariableConfig = mongoose.model<IPlcVariableConfig>('PlcVariableConfig', plcVariableConfigSchema); 