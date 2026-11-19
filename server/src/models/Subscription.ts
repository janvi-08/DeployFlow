import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISubscription extends Document {
  orgId: Types.ObjectId;
  plan: 'free' | 'pro' | 'enterprise';
  stripeSubscriptionId?: string;
  priceId?: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organisation', required: true, unique: true, index: true },
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    stripeSubscriptionId: { type: String },
    priceId: { type: String },
    status: { type: String, enum: ['active', 'canceled', 'past_due', 'trialing'], default: 'active' },
    currentPeriodEnd: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
