import mongoose, { Document, Schema } from 'mongoose';

export interface IContactSubmission extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  appointmentDate?: Date;
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: Date;
}

const ContactSubmissionSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  appointmentDate: { type: Date },
  status: { type: String, enum: ['pending', 'in-progress', 'resolved'], default: 'pending' },
}, {
  timestamps: true,
});

export default mongoose.models.ContactSubmission || mongoose.model<IContactSubmission>('ContactSubmission', ContactSubmissionSchema);