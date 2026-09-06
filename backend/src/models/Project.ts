import mongoose, { Schema } from 'mongoose';
import { IProject, ProjectStatus } from '../types';

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.ACTIVE,
    },
    color: {
      type: String,
      trim: true,
      default: '#3b82f6',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index for faster queries
projectSchema.index({ status: 1 });
projectSchema.index({ name: 1 });

export const Project = mongoose.model<IProject>('Project', projectSchema);
