import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  seller: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number; // Integer santim
  category: string;
  images: string[];
  stock: number;
  reserved: number;
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, index: 'text' },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 }, // In integer santim
    category: { type: String, required: true, index: true },
    images: [{ type: String }],
    stock: { type: Number, required: true, min: 0, default: 0 },
    reserved: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    version: { type: Number, default: 1 },
  },
  { timestamps: true, optimisticConcurrency: true }
);

productSchema.index({ category: 1, isActive: 1, price: 1 });

export default mongoose.model<IProduct>('Product', productSchema);
