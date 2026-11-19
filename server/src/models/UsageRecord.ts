import mongoose, { Document, Schema, Types } from 'mongoose';

export type UsageMetric = 'deployments' | 'api_calls' | 'build_minutes' | 'team_members';

export interface IUsageRecord extends Document {
  orgId: Types.ObjectId;
  metric: UsageMetric;
  quantity: number;
  periodStart: Date;
  createdAt: Date;
  updatedAt: Date;
}

const usageRecordSchema = new Schema<IUsageRecord>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
    metric: {
      type: String,
      enum: ['deployments', 'api_calls', 'build_minutes', 'team_members'],
      required: true,
      index: true,
    },
    quantity: { type: Number, default: 0 },
    periodStart: { type: Date, required: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast upsert and aggregation per org, metric, and period
usageRecordSchema.index({ orgId: 1, metric: 1, periodStart: 1 }, { unique: true });

export const UsageRecord = mongoose.model<IUsageRecord>('UsageRecord', usageRecordSchema);
