import mongoose, { Document, Schema } from 'mongoose';

export interface IRentalBike extends Document {
  name: string;
  type: string;
  pricePerDay: number;
  images: string[];
  isAvailable: boolean;
}

const RentalBikeSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  pricePerDay: { type: Number, required: true },
  images: [{ type: String, required: true }],
  isAvailable: { type: Boolean, default: true },
}, {
  timestamps: true,
});

RentalBikeSchema.virtual('image').get(function(this: IRentalBike) {
  return this.images && this.images.length > 0 ? this.images[0] : '';
});

RentalBikeSchema.set('toJSON', { virtuals: true });
RentalBikeSchema.set('toObject', { virtuals: true });

export default mongoose.models.RentalBike || mongoose.model<IRentalBike>('RentalBike', RentalBikeSchema);
