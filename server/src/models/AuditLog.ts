import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAuditLog extends Document {
  orgId?: Types.ObjectId;
  actorId?: Types.ObjectId;
  action: string;
  meta: Record<string, unknown>;
  at: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organisation', index: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true, index: true },
    meta: { type: Schema.Types.Mixed, default: {} },
    at: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: false,
  }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
