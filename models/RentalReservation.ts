import mongoose, { Document, Schema } from 'mongoose';

export interface IRentalReservation extends Document {
  rentalBikeId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'PENDING_PAYMENT' | 'PAID' | 'REFUNDED';
  paymentProofUrl?: string;
  paymentProofUploadedAt?: Date;
  referenceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  createdAt: Date;
}

const RentalReservationSchema: Schema = new Schema({
  rentalBikeId: { type: Schema.Types.ObjectId, ref: 'RentalBike', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  paymentStatus: { 
    type: String, 
    enum: ['PENDING_PAYMENT', 'PAID', 'REFUNDED'], 
    default: 'PENDING_PAYMENT' 
  },
  paymentProofUrl: { type: String },
  paymentProofUploadedAt: { type: Date },
  referenceNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  notes: { type: String },
}, {
  timestamps: true,
});

RentalReservationSchema.index({ referenceNumber: 1 });
RentalReservationSchema.index({ customerId: 1 });

export default mongoose.models.RentalReservation || mongoose.model<IRentalReservation>('RentalReservation', RentalReservationSchema);