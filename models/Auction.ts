import mongoose, { Document, Schema } from 'mongoose';
import { AuctionCategory } from '../app/types';

export interface IAuction extends Document {
  name: string;
  description: string;
  images: string[];
  currentBid: number;
  minIncrement: number;
  startTime: Date;
  endTime: Date;
  status: 'UPCOMING' | 'LIVE' | 'ENDED';
  bidHistory: { user: Schema.Types.ObjectId; amount: number; time: Date }[];
  winner?: Schema.Types.ObjectId;
  category: AuctionCategory;
}

const BidHistorySchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    time: { type: Date, required: true },
});

const AuctionSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true }],
  currentBid: { type: Number, required: true, default: 0 },
  minIncrement: { type: Number, required: true, default: 1 },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['UPCOMING', 'LIVE', 'ENDED'], required: true, default: 'UPCOMING' },
  category: { type: String, enum: Object.values(AuctionCategory), default: AuctionCategory.OTHER },
  bidHistory: [BidHistorySchema],
  winner: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

AuctionSchema.virtual('image').get(function(this: IAuction) {
  return this.images && this.images.length > 0 ? this.images[0] : '';
});

AuctionSchema.set('toJSON', { virtuals: true });
AuctionSchema.set('toObject', { virtuals: true });

AuctionSchema.index({ startTime: 1 });
AuctionSchema.index({ endTime: 1 });
AuctionSchema.index({ status: 1 });

export default mongoose.models.Auction || mongoose.model<IAuction>('Auction', AuctionSchema);
