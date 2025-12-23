import mongoose, { Document, Schema } from 'mongoose';
import { AuctionCategory } from '../app/types'; // Import AuctionCategory

export interface IAuction extends Document {
  name: string;
  description: string;
  image: string;
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
  image: { type: String, required: true },
  currentBid: { type: Number, required: true, default: 0 },
  minIncrement: { type: Number, required: true, default: 1 },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['UPCOMING', 'LIVE', 'ENDED'], required: true, default: 'UPCOMING' },
  category: { type: String, enum: Object.values(AuctionCategory), default: AuctionCategory.OTHER }, // Add category field
  bidHistory: [BidHistorySchema],
  winner: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

export default mongoose.models.Auction || mongoose.model<IAuction>('Auction', AuctionSchema);
