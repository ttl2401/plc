import mongoose, { Schema, model, Document, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export const TYPES = ['maintenance_clean_filter'] as const;

export interface SystemSetting extends Document {
  key: typeof TYPES[number];
  value: any;
  createdAt?: Date;
  updatedAt?: Date;
}

const SystemSettingSchema = new Schema<SystemSetting>({
    key: {
    type: String,
    enum: TYPES,
    required: true,
    unique: true
  },
  value: {
    type: Schema.Types.Mixed,
    required: true,
  },
},
{
    timestamps: true,
    collection: 'SystemSettings',
});

SystemSettingSchema.plugin(mongoosePaginate);

export const SystemSetting = mongoose.model<SystemSetting, PaginateModel<SystemSetting>>('SystemSettings', SystemSettingSchema); 