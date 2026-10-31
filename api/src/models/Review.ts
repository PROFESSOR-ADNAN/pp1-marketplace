import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  rating: number; // 1 - 5
  comment: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, minlength: 5, maxlength: 1000 },
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, buyer: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', reviewSchema);
