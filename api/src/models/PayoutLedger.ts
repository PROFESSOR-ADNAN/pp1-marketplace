import mongoose, { Document, Schema } from 'mongoose';

export interface IPayoutLedger extends Document {
  seller: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  grossAmount: number; // Integer santim
  commissionAmount: number; // 5% in integer santim
  netAmount: number; // 95% in integer santim
  status: 'pending' | 'paid';
  paidAt?: Date;
}

const payoutLedgerSchema = new Schema<IPayoutLedger>(
  {
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    grossAmount: { type: Number, required: true },
    commissionAmount: { type: Number, required: true },
    netAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending', index: true },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IPayoutLedger>('PayoutLedger', payoutLedgerSchema);
