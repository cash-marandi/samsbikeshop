import mongoose, { Document, Schema } from 'mongoose';

export enum RequestType {
  BIKE = 'Bike',
  PART = 'Part',
  OTHER = 'Other',
}

export enum RequestStatus {
  PENDING = 'Pending',
  REVIEWED = 'Reviewed',
  FULFILLED = 'Fulfilled',
  ARCHIVED = 'Archived',
}

export interface IBikeRequest extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  userName: string;
  userEmail: string;
  requestType: RequestType;
  details: string;
  budget?: number;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const BikeRequestSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  requestType: { type: String, enum: Object.values(RequestType), required: true },
  details: { type: String, required: true, maxlength: 1000 },
  budget: { type: Number, min: 0 },
  status: { type: String, enum: Object.values(RequestStatus), default: RequestStatus.PENDING },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.BikeRequest || mongoose.model<IBikeRequest>('BikeRequest', BikeRequestSchema);
