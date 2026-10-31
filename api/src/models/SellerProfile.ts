import mongoose, { Document, Schema } from 'mongoose';

export interface ISellerProfile extends Document {
  user: mongoose.Types.ObjectId;
  businessName: string;
  businessRegNumber?: string;
  storeDescription: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const sellerProfileSchema = new Schema<ISellerProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    businessName: { type: String, required: true, trim: true },
    businessRegNumber: { type: String, trim: true },
    storeDescription: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ISellerProfile>('SellerProfile', sellerProfileSchema);
