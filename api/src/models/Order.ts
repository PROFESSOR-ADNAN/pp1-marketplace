import mongoose, { Document, Schema } from 'mongoose';
import { ORDER_STATUS, OrderStatus, PAYMENT_STATUS, PaymentStatus } from '@souq/shared';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  name: string;
  price: number; // Integer santim snapshot
  quantity: number;
}

export interface IOrder extends Document {
  buyer: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number; // Integer santim
  status: OrderStatus;
  deliveryAddress: {
    region: string;
    city: string;
    subCity: string;
    woreda?: string;
    landmark: string;
    phone: string;
  };
  payment: {
    provider: string;
    txRef: string;
    chapaRef?: string;
    status: PaymentStatus;
    verifiedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.PENDING_PAYMENT, index: true },
    deliveryAddress: {
      region: { type: String, required: true },
      city: { type: String, required: true },
      subCity: { type: String, required: true },
      woreda: { type: String },
      landmark: { type: String, required: true },
      phone: { type: String, required: true },
    },
    payment: {
      provider: { type: String, default: 'chapa' },
      txRef: { type: String, required: true, unique: true, index: true },
      chapaRef: { type: String },
      status: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING },
      verifiedAt: { type: Date },
    },
  },
  { timestamps: true }
);

orderSchema.index({ 'items.seller': 1, status: 1 });
orderSchema.index({ buyer: 1, createdAt: -1 });

export default mongoose.model<IOrder>('Order', orderSchema);
