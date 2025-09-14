import mongoose, { Document, Schema } from 'mongoose';

export interface ITenant extends Document {
  slug: string;
  name: string;
  subscription: 'free' | 'pro';
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema: Schema = new Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
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
