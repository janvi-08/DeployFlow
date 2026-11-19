import mongoose, { Document, Schema } from 'mongoose';

export interface IFeatureFlag extends Document {
  key: string;
  description: string;
  enabledForPlans: ('free' | 'pro' | 'enterprise')[];
  rolloutPct: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const featureFlagSchema = new Schema<IFeatureFlag>(
  {
    key: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, default: '' },
    enabledForPlans: {
      type: [String],
      enum: ['free', 'pro', 'enterprise'],
      default: ['pro', 'enterprise'],
    },
    rolloutPct: { type: Number, min: 0, max: 100, default: 100 },
    enabled: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const FeatureFlag = mongoose.model<IFeatureFlag>('FeatureFlag', featureFlagSchema);
