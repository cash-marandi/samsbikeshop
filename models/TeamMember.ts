import mongoose, { Document, Schema } from 'mongoose';
import { UserRole } from '../app/types'; // Assuming UserRole is defined in app/types

export interface ITeamMember extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole; // e.g., 'TEAM_ADMIN', 'EDITOR', 'VIEWER'
  image: string; // New: image URL for the team member
}

const TeamMemberSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false }, // Password should not be returned by default
  role: { type: String, enum: Object.values(UserRole), default: 'VIEWER' },
  image: { type: String, required: true }, // New: image URL field
}, {
  timestamps: true,
});

export default mongoose.models.TeamMember || mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);
