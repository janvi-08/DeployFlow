import mongoose, { Document, Schema, Types } from 'mongoose';

export type PlanType = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'past_due';

export interface IOrganisation extends Document {
  name: string;
  slug: string;
  ownerId: Types.ObjectId;
  plan: PlanType;
  stripeCustomerId?: string;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const organisationSchema = new Schema<IOrganisation>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free', index: true },
    stripeCustomerId: { type: String },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'trialing', 'canceled', 'past_due'],
      default: 'active',
    },
    trialEndsAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

organisationSchema.set('toJSON', {
  transform: (_, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export const Organisation = mongoose.model<IOrganisation>('Organisation', organisationSchema);
