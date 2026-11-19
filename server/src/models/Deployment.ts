import mongoose, { Schema, Document } from 'mongoose';

export interface IDeployment extends Document {
  organisation: mongoose.Types.ObjectId;
  project?: mongoose.Types.ObjectId;
  deploymentId: string;
  commit: string;
  message: string;
  branch: string;
  status: string;
  duration: string;
  environment: string;
  sender: string;
  siteDir?: string;
  liveUrl?: string;
  buildLogs: string[];
  deployedFiles: string[];
  fileCount: number;
  bundleSize: string;
  isCurrentLive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DeploymentSchema = new Schema<IDeployment>(
  {
    organisation: {
      type: Schema.Types.ObjectId,
      ref: 'Organisation',
      required: true,
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      index: true,
    },
    deploymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    commit: {
      type: String,
      required: true,
      default: 'main',
    },
    message: {
      type: String,
      required: true,
      default: 'Update codebase',
    },
    branch: {
      type: String,
      default: 'main',
    },
    status: {
      type: String,
      enum: ['Completed', 'Building', 'Failed', 'Rollback', 'Active'],
      default: 'Completed',
    },
    duration: {
      type: String,
      default: '3.8s',
    },
    environment: {
      type: String,
      default: 'production',
    },
    sender: {
      type: String,
      default: 'git-push',
    },
    siteDir: {
      type: String,
      default: '',
    },
    liveUrl: {
      type: String,
      default: '',
    },
    buildLogs: {
      type: [String],
      default: [],
    },
    deployedFiles: {
      type: [String],
      default: [],
    },
    fileCount: {
      type: Number,
      default: 0,
    },
    bundleSize: {
      type: String,
      default: '0 KB',
    },
    isCurrentLive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Deployment = mongoose.model<IDeployment>('Deployment', DeploymentSchema);
