import mongoose, { Schema, model, Document, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export const ACTIONS = ['chemical_washing_tank', 'chemical_pre_nickel_plating_tank', 'chemical_boiling_degreasing_tank'] as const;

export interface HistoryChemicalAddition extends Document {
  action: typeof ACTIONS[number];
  date: string; 
  pumps?: Array<{
    startedAt?: Date | null;  
    endedAt?: Date | null;  
  }>;
  ampereConsumption : Number;
  createdAt?: Date;
  updatedAt?: Date;
}

const pumpSchema = new Schema({
    startedAt: { type: Date, required: false },
    endedAt: { type: Date, required: false }
  }, { _id: false });

const HistoryChemicalAdditionSchema = new Schema<HistoryChemicalAddition>({
  action: {
    type: String,
    enum: ACTIONS,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  pumps: {
    type: [
        pumpSchema
    ],
    required: true
  },
  ampereConsumption: {
    type: Number,
    required: false
  }
},
{
    timestamps: true,
    collection: 'HistoryChemicalAddition',
});

HistoryChemicalAdditionSchema.plugin(mongoosePaginate);

export const HistoryChemicalAddition = mongoose.model<HistoryChemicalAddition, PaginateModel<HistoryChemicalAddition>>('HistoryChemicalAddition', HistoryChemicalAdditionSchema); 