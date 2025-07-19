import mongoose, { Schema, model, Document, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';


export interface LiquidWarning extends Document {
  date: string; 
  tank: string;
  warningLevel: string;
  warningAt : Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const LiquidWarningSchema = new Schema<LiquidWarning>({
  tank: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  warningAt: {
    type: Date,
    required: true,
  },
  warningLevel: {
    type: String,
    required: false
  }
},
{
    timestamps: true,
    collection: 'LiquidWarning',
});

LiquidWarningSchema.plugin(mongoosePaginate);

export const LiquidWarning = mongoose.model<LiquidWarning, PaginateModel<LiquidWarning>>('LiquidWarning', LiquidWarningSchema); 