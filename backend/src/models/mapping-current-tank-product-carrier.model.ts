// Dùng để ghi nhận khi nào thì hồ nào đang chạy product nào, 
// phục vụ cho thống kê nhiệt độ, dòng điện
import mongoose, { Document, Schema } from 'mongoose';

export interface IMappingTankProductCarrier extends Document {
  tankId: number; 
  tankKey: string;
  productCode: string;
  carrierPick : number;
  createdAt?: Date;
  updatedAt?: Date;
}

const MappingTankProductCarrierSchema = new Schema<IMappingTankProductCarrier>({
  tankId: {
    type: Number,
    required: true,
  },
  tankKey: {
    type: String,
    required: true,
  },
  productCode: {
    type: String,
    required: false,
  },
  carrierPick: {
    type: Number,
    required: false,
  }
},
{
    timestamps: true,
    collection: 'PlcMappingTankWithProductAndCarrierPick',
});


MappingTankProductCarrierSchema.index({ tankId: 1 });
MappingTankProductCarrierSchema.index({ productCode: 1 });
MappingTankProductCarrierSchema.index({ carrierPick: 1 });
MappingTankProductCarrierSchema.index({ tankId: 1, productCode: 1, carrierPick: 1 });

export const MappingTankProductCarrier = mongoose.model<IMappingTankProductCarrier>('PlcMappingTankWithProductAndCarrierPick', MappingTankProductCarrierSchema); 