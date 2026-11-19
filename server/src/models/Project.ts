import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectEnvVar {
  key: string;
  value: string;
  isSecret?: boolean;
  target?: 'production' | 'preview' | 'development' | 'all';
}

export interface IProjectCustomDomain {
  domain: string;
  status: 'verified' | 'pending' | 'failed';
  sslStatus: 'active' | 'issuing' | 'expired';
  cnameRecord: string;
  verifiedAt?: Date;
}

export interface IProjectAnalytics {
  totalRequests: number;
  avgResponseTimeMs: number;
  bandwidthBytes: number;
  lastRequestAt?: Date;
  statusCodes?: Record<string, number>;
}

export interface IProject extends Document {
  organisation: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  framework: 'static' | 'react' | 'vue' | 'node' | 'html';
  sourceType: 'template' | 'upload' | 'git' | 'code';
  templateId?: string;
  gitRepoUrl?: string;
  gitBranch?: string;
  buildCommand?: string;
  outputDir?: string;
  envVars: IProjectEnvVar[];
  customDomains: IProjectCustomDomain[];
  activeDeployment?: mongoose.Types.ObjectId;
  liveUrl: string;
  analytics: IProjectAnalytics;
  status: 'active' | 'deploying' | 'failed' | 'paused';
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    organisation: {
      type: Schema.Types.ObjectId,
      ref: 'Organisation',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    framework: {
      type: String,
      enum: ['static', 'react', 'vue', 'node', 'html'],
      default: 'static',
    },
    sourceType: {
      type: String,
      enum: ['template', 'upload', 'git', 'code'],
      default: 'template',
    },
    templateId: {
      type: String,
      default: '',
    },
    gitRepoUrl: {
      type: String,
      default: '',
    },
    gitBranch: {
      type: String,
      default: 'main',
    },
    buildCommand: {
      type: String,
      default: '',
    },
    outputDir: {
      type: String,
      default: '.',
    },
    envVars: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
        isSecret: { type: Boolean, default: false },
        target: {
          type: String,
          enum: ['production', 'preview', 'development', 'all'],
          default: 'all',
        },
      },
    ],
    customDomains: [
      {
        domain: { type: String, required: true },
        status: {
          type: String,
          enum: ['verified', 'pending', 'failed'],
          default: 'verified',
        },
        sslStatus: {
          type: String,
          enum: ['active', 'issuing', 'expired'],
          default: 'active',
        },
        cnameRecord: { type: String, default: 'cname.deployflow.edge' },
        verifiedAt: { type: Date, default: Date.now },
      },
    ],
    activeDeployment: {
      type: Schema.Types.ObjectId,
      ref: 'Deployment',
    },
    liveUrl: {
      type: String,
      default: '',
    },
    analytics: {
      totalRequests: { type: Number, default: 0 },
      avgResponseTimeMs: { type: Number, default: 12 },
      bandwidthBytes: { type: Number, default: 0 },
      lastRequestAt: { type: Date },
      statusCodes: { type: Map, of: Number, default: {} },
    },
    status: {
      type: String,
      enum: ['active', 'deploying', 'failed', 'paused'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

ProjectSchema.index({ organisation: 1, slug: 1 }, { unique: true });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
