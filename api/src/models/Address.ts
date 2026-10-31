import mongoose, { Document, Schema } from 'mongoose';

export interface IAddress extends Document {
  user: mongoose.Types.ObjectId;
  region: string;
  city: string;
  subCity: string;
  woreda?: string;
  landmark: string;
  phone: string;
  isDefault: boolean;
}

const addressSchema = new Schema<IAddress>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    region: { type: String, required: true },
    city: { type: String, required: true },
    subCity: { type: String, required: true },
    woreda: { type: String },
    landmark: { type: String, required: true },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IAddress>('Address', addressSchema);
