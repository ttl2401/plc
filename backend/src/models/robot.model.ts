import mongoose, { Document, Schema } from 'mongoose';

export interface IRobot extends Document {
  name: string;
  key: string;
  active: boolean;
  barrelSettings: {
    topDwellTime: number;
    loweringWaitingTime: number;
    bottomDwellTime: number;
  };
  rackSettings: {
    topDwellTime: number;
    loweringWaitingTime: number;
    bottomDwellTime: number;
  };
}

const dwellTimeSchema = {
  topDwellTime: { type: Number, min: 0, default: 0 },
  loweringWaitingTime: { type: Number, min: 0, default: 0 },
  bottomDwellTime: { type: Number, min: 0, default: 0 },
};

const robotSchema = new Schema<IRobot>({
    name: { type: String, required: true, trim: true },
    key: { type: String, required: true, trim: true, unique: true },
    active: {
      type: Boolean,
      default: true,
    },
    barrelSettings: { 
      type: dwellTimeSchema, 
      required: true, 
      default: () => ({}) 
    },
    rackSettings: { 
      type: dwellTimeSchema, 
      required: true, 
      default: () => ({}) 
    },
  },
  {
    collection: 'Robot'
  }
);

export const Robot = mongoose.model<IRobot>('Robot', robotSchema); 