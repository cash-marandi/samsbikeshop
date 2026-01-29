import mongoose, { Document, Schema } from 'mongoose';
import { ProductType } from '../app/types';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  image: string;
  type: ProductType;
  brand: string;
  isSold: boolean;
  isSpecial?: boolean;
  discount?: number;
  stock: number;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  type: { type: String, enum: Object.values(ProductType), required: true },
  brand: { type: String, required: true },
  isSold: { type: Boolean, default: false },
  isSpecial: { type: Boolean, default: false },
  discount: { type: Number, default: 0 },
  stock: { type: Number, required: true, default: 0 },
}, {
  timestamps: true,
});

// Indexes for performance
ProductSchema.index({ isSold: 1 });
ProductSchema.index({ type: 1 });
ProductSchema.index({ brand: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
