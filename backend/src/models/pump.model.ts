import mongoose, { Document, Schema } from 'mongoose';

export interface IPump extends Document {
  name: string;
  key: string;
  type: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pumpSchema = new Schema<IPump>(
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
      trim: true,
    },
    type : {
        type: String,
        required: true,
        enum: ['electric', 'non_electric'],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'Pumps',
  }
);

// Index for faster queries on name and key
pumpSchema.index({ name: 1 });
pumpSchema.index({ key: 1 }, { unique: true });

export const Pump = mongoose.model<IPump>('Pumps', pumpSchema); 