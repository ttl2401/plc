// Dùng để mapping Carrier Pick ID với product được apply tại thời điểm đó ( bấm apply khi scan)
import mongoose, { Document, Schema } from 'mongoose';

export interface IPlcMappingCarrierPickProductCode extends Document {
  carrierPickId: number;
  productCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const plcMappingCarrierPickProductCodeSchema = new Schema<IPlcMappingCarrierPickProductCode>(
  {
    carrierPickId: {
      type: Number,
      required: true,
    },
    productCode: {
        type: String,
        required: true,
    }
  },
  {
    timestamps: true,
    collection: 'PlcMappingCarrierPickProductCode',
  }
);

// Index for faster queries on name and key
plcMappingCarrierPickProductCodeSchema.index({ carrierPickId: 1 });
plcMappingCarrierPickProductCodeSchema.index({ productCode: 1 });

export const MappingCarrierCode = mongoose.model<IPlcMappingCarrierPickProductCode>('PlcMappingCarrierPickProductCode', plcMappingCarrierPickProductCodeSchema); 