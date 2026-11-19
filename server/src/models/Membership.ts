import mongoose, { Document, Schema, Types } from 'mongoose';

export type MemberRole = 'owner' | 'admin' | 'member';

export interface IMembership extends Document {
  orgId: Types.ObjectId;
  userId?: Types.ObjectId;
  role: MemberRole;
  invitedEmail?: string;
  inviteToken?: string;
  invitedAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const membershipSchema = new Schema<IMembership>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
    invitedEmail: { type: String, lowercase: true, trim: true },
    inviteToken: { type: String, index: true },
    invitedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only have one membership per organisation
membershipSchema.index({ orgId: 1, userId: 1 }, { unique: true, sparse: true });

membershipSchema.set('toJSON', {
  transform: (_, ret: any) => {
    delete ret.__v;
    delete ret.inviteToken;
    return ret;
  },
});

export const Membership = mongoose.model<IMembership>('Membership', membershipSchema);
