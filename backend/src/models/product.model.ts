import mongoose, { Document, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { productPlatingModes } from '@/config/constant';

const enumProductPlatingMode = productPlatingModes.map(item => item.key);
export interface IProduct extends Document {
  code: string;
  name?: string;
  sizeDm2?: number; // Assuming size is a number in dm2
  image?: string; // URL or path to the image
  imageUrl?: string; // Derived from image path, optional
  createdAt: Date;
  updatedAt: Date;
  settings: IProductSetting[];
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
  line: number;
  mode: string;
  defaultPlating?: {
    tankAndGroups: Array<{
      model: string;
      modelId: string;
      modelKey: string;
      modelName: string;
      currentTotal: number;
      T1: number;
    }>;
  } | null;
  rackPlating?: {
    jigCarrier: number;
    pcsJig: number;
    timer: number;
    tankAndGroups: Array<{
      model: string;
      modelId: string;
      modelKey: string;
      modelName: string;
      currentJig: number;
      currentTotal: number;
      T1: number;
      T2: number;
    }>;
  } | null;
  barrelPlating?: {
    kgBarrel: number;
    timer: number;
    tankAndGroups: Array<{
      model: string;
      modelId: string;
      modelKey: string;
      modelName: string;
      currentTotal: number;
      T1: number;
      T2: number;
    }>;
  } | null
}

const productSettingSchemaEntry = new Schema({
  line: { type: Number, required: true },
  mode: { type: String, required: true, enum: enumProductPlatingMode, default : 'default' },
  defaultPlating: {
    type: {
      tankAndGroups: [{
        model: String,
        modelId: String,
        modelKey: String,
        modelName: String,
        currentJig: Number,
        currentTotal: Number,
        T1: Number,
        T2: Number
      }]
    },
    default: null,
    required: false
  },
  rackPlating: {
    type: {
      jigCarrier: Number,
      pcsJig: Number,
      timer: Number,
      tankAndGroups: [{
        model: String,
        modelId: String,
        modelKey: String,
        modelName: String,
        currentJig: Number,
        currentTotal: Number,
        T1: Number,
        T2: Number
      }]
    },
    default: null,
    required: false
  },
  barrelPlating: {
    type: {
      kgBarrel: Number,
      timer: Number,
      tankAndGroups: [{
        model: String,
        modelId: String,
        modelKey: String,
        modelName: String,
        currentTotal: Number,
        T1: Number,
        T2: Number
      }]
    },
    default: null,
    required: false
  }
}, { _id: false });

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
      trim: false,
    },
    sizeDm2: {
      type: Number,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    settings: {
      type: [productSettingSchemaEntry],
      default: null
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

// Pre-save middleware to enforce uniqueness of 'line' in settings array
productSchema.pre('save', function(next) {
  if (this.settings && this.isModified('settings')) {
    const lines = this.settings.map(s => s.line);
    const hasDuplicates = new Set(lines).size !== lines.length;
    if (hasDuplicates) {
      const err = new Error('The "line" in product settings must be unique.');
      return next(err);
    }
  }
  next();
});

export const Product = mongoose.model<IProduct, mongoose.PaginateModel<IProduct>>('Products', productSchema); 