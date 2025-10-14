import mongoose, { Document, Schema } from 'mongoose';

export interface IPlcVariable extends Document {
  name: string;
  dbNumber: number;
  dataType: string;
  offset: number;
  type: string;
  startValue: any;
  value: any;
  createdAt: Date;
  updatedAt: Date;
}

const plcVariableSchema = new Schema<IPlcVariable>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dbNumber : {
        type: Number,
        required: true,
    },
    dataType : {
        type: String,
        required: true,
        enum: ['Real', 'Int', 'Bool', 'DInt', 'LReal'],
    },
    offset : {
        type: Number,
        required: true,
    },
    startValue : {
        type: mongoose.Schema.Types.Mixed,
        required: false,
    },
    type : {
        type: String,
        required: false
    },
    value : {
        type: mongoose.Schema.Types.Mixed,
        required: false
    },
  },
  {
    timestamps: true,
    collection: 'PlcVariables',
  }
);

// Index for faster queries on name and key
plcVariableSchema.index({ name: 1 });

export const PlcVariable = mongoose.model<IPlcVariable>('PlcVariables', plcVariableSchema); 