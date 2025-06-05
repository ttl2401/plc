import mongoose, { Document, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IProduct extends Document {
  code: string;
  name: string;
  sizeDm2: number; // Assuming size is a number in dm2
  image?: string; // URL or path to the image
  qrCode?: string; // Data for the QR code
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sizeDm2: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
    },
    qrCode: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Add pagination plugin
productSchema.plugin(mongoosePaginate);

// Index for faster queries on code and name
productSchema.index({ code: 1 });
productSchema.index({ name: 1 });

export const Product = mongoose.model<IProduct, mongoose.PaginateModel<IProduct>>('Product', productSchema); 