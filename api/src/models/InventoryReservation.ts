import mongoose, { Document, Schema } from 'mongoose';

export interface IReservationItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IInventoryReservation extends Document {
  orderId: mongoose.Types.ObjectId;
  items: IReservationItem[];
  status: 'active' | 'committed' | 'released';
  expiresAt: Date;
}

const reservationItemSchema = new Schema<IReservationItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const inventoryReservationSchema = new Schema<IInventoryReservation>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true, index: true },
    items: [reservationItemSchema],
    status: { type: String, enum: ['active', 'committed', 'released'], default: 'active', index: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
  },
  { timestamps: true }
);

export default mongoose.model<IInventoryReservation>('InventoryReservation', inventoryReservationSchema);
