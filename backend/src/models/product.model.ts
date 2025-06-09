import mongoose, { Document, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IProduct extends Document {
  code: string;
  name: string;
  sizeDm2: number; // Assuming size is a number in dm2
  image?: string; // URL or path to the image
  imageUrl?: string; // Derived from image path, optional
  createdAt: Date;
  updatedAt: Date;
}

// New interface for transformed product data (plain object)
export interface ITransformedProduct {
  _id: string;
  code: string;
  name: string;
  sizeDm2: number;
  image?: string;
  imageUrl?: string;
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
    }
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