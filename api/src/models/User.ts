import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, Role } from '@souq/shared';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: Role;
  totpSecret?: string;
  totpEnabled: boolean;
  matchPassword(entered: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.BUYER, index: true },
    totpSecret: { type: String, select: false },
    totpEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (entered: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
