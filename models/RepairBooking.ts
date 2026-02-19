import mongoose, { Document, Schema } from 'mongoose';

export interface IRepairBooking extends Document {
  userId?: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address?: string;
  serviceType: string;
  packageName: string;
  price: number;
  bikeDescription?: string;
  issueDescription?: string;
  preferredDate?: Date;
  isMobileService: boolean;
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'PENDING_PAYMENT' | 'PAID' | 'REFUNDED';
  paymentProofUrl?: string;
  paymentProofUploadedAt?: Date;
  referenceNumber: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RepairBookingSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  address: { type: String },
  serviceType: { type: String, required: true },
  packageName: { type: String, required: true },
  price: { type: Number, required: true },
  bikeDescription: { type: String },
  issueDescription: { type: String },
  preferredDate: { type: Date },
  isMobileService: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['PENDING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], 
    default: 'PENDING_PAYMENT' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['PENDING_PAYMENT', 'PAID', 'REFUNDED'], 
    default: 'PENDING_PAYMENT' 
  },
  paymentProofUrl: { type: String },
  paymentProofUploadedAt: { type: Date },
  referenceNumber: { type: String, required: true, unique: true },
  notes: { type: String },
}, {
  timestamps: true,
});

RepairBookingSchema.index({ referenceNumber: 1 });
RepairBookingSchema.index({ customerEmail: 1 });
RepairBookingSchema.index({ userId: 1 });

export default mongoose.models.RepairBooking || mongoose.model<IRepairBooking>('RepairBooking', RepairBookingSchema);
