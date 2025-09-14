import mongoose, { Document, Schema } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  slug: string;
  subscription: 'free' | 'pro';
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  subscription: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free',
  },
}, {
  timestamps: true,
});

export default mongoose.models.Tenant || mongoose.model<ITenant>('Tenant', TenantSchema);
