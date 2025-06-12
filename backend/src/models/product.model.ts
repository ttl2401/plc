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
  settings?: IProductSetting;
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

export interface IProductSetting {
  rackPlating: {
    jigCarrier: number;
    pcsJig: number;
    timer: number;
    tanks: [
      {
        tankId: string;
        tankInfo: {
          [key: string]: any;
        };
        currentJig: number;
        T1: number;
        T2: number;
      }
    ]
  };
  barrelPlating: {
    kgBarel: number;
    timger: number;
    tanks : [
      {
        tankId: string;
        tankInfo: {
          [key: string]: any;
        };
        currentJig: number;
        T1: number;
        T2: number;
      }
    ]
  }
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
    settings: {
      type: {
        rackPlating: {
          jigCarrier: Number,
          pcsJig: Number,
          timer: Number,
          tanks: [{
            tankId: String,
            tankInfo: Schema.Types.Mixed,
            currentJig: Number,
            T1: Number,
            T2: Number
          }]
        },
        barrelPlating: {
          kgBarel: Number,
          timger: Number,
          tanks: [{
            tankId: String,
            tankInfo: Schema.Types.Mixed,
            currentJig: Number,
            T1: Number,
            T2: Number
          }]
        }
      },
      default: undefined
    }
  },
  {
    timestamps: true,
    collection: 'Products'
  }
);

// Add pagination plugin
productSchema.plugin(mongoosePaginate);

// Index for faster queries on code and name
productSchema.index({ code: 1 });
productSchema.index({ name: 1 });

export const Product = mongoose.model<IProduct, mongoose.PaginateModel<IProduct>>('Product', productSchema); 