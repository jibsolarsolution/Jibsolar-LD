import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  profession?: string;
  city?: string;
  countryCode: string;
  timezone: string;
  status: 'ACTIVE' | 'DELETED' | 'ONHOLD';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    profession: { type: String },
    city: { type: String },
    countryCode: { type: String, default: '+91' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    status: { type: String, enum: ['ACTIVE', 'DELETED', 'ONHOLD'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

UserSchema.index({ createdAt: -1 });
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema, 'users');

export default User;
