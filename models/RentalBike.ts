import mongoose, { Document, Schema } from 'mongoose';

export interface IRentalBike extends Document {
  name: string;
  type: string;
  pricePerDay: number;
  image: string;
  isAvailable: boolean;
}

const RentalBikeSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  pricePerDay: { type: Number, required: true },
  image: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
}, {
  timestamps: true,
});

export default mongoose.models.RentalBike || mongoose.model<IRentalBike>('RentalBike', RentalBikeSchema);
