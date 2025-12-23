import mongoose, { Document, Schema } from 'mongoose';

export interface INewsPost extends Document {
  title: string;
  content: string;
  date: Date;
  image: string;
  author: string;
}

const NewsPostSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, required: true },
  image: { type: String, required: true },
  author: { type: String, required: true },
}, {
  timestamps: true,
});

export default mongoose.models.NewsPost || mongoose.model<INewsPost>('NewsPost', NewsPostSchema);
