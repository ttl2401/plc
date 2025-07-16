import mongoose, { Schema, model, Document, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export const ACTIONS = ['press_estop_1', 'press_estop_2'] as const;

export interface HistoryOperation extends Document {
  action: typeof ACTIONS[number];
  date: string; // Only date part is relevant (YYYY-MM-DD)
  startedAt: Date;
  endedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const HistoryOperationSchema = new Schema<HistoryOperation>({
  action: {
    type: String,
    enum: ACTIONS,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  startedAt: {
    type: Date,
    required: true,
  },
  endedAt: {
    type: Date
  },
},
{
    timestamps: true,
    collection: 'HistoryOperation',
});

HistoryOperationSchema.plugin(mongoosePaginate);

export const HistoryOperation = mongoose.model<HistoryOperation, PaginateModel<HistoryOperation>>('HistoryOperation', HistoryOperationSchema); 