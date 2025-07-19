import mongoose, { Schema, model, Document, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export const ACTIONS = ['water_washing_tank', 'water_nickel_plating_tank', 'water_electro_degreasing_tank'] as const;

export interface HistoryWaterAddition extends Document {
  action: typeof ACTIONS[number];
  date: string; // Only date part is relevant (YYYY-MM-DD)
  startedAt: Date;
  endedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const HistoryWaterAdditionSchema = new Schema<HistoryWaterAddition>({
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
    collection: 'HistoryWaterAddition',
});

HistoryWaterAdditionSchema.plugin(mongoosePaginate);

export const HistoryWaterAddition = mongoose.model<HistoryWaterAddition, PaginateModel<HistoryWaterAddition>>('HistoryWaterAddition', HistoryWaterAdditionSchema); 