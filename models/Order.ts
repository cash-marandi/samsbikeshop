import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  referenceNumber: string;
  userId?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  status: 'PENDING_PAYMENT' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: string;
  paymentProofUrl?: string;
  paymentProofUploadedAt?: Date;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
  referenceNumber: { type: String, required: true, unique: true },
  userId: { type: String },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    city: { type: String },
    postalCode: { type: String },
  },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  }],
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING_PAYMENT',
  },
  paymentMethod: { type: String, default: 'EFT' },
  paymentProofUrl: { type: String },
  paymentProofUploadedAt: { type: Date },
  trackingNumber: { type: String },
  notes: { type: String },
}, {
  timestamps: true,
});

OrderSchema.index({ referenceNumber: 1 });
OrderSchema.index({ 'customer.email': 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ userId: 1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
