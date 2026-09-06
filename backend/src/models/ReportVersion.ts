import mongoose, { Schema } from 'mongoose';
import { IReportVersion } from '../types';

const reportVersionSchema = new Schema<IReportVersion>(
  {
    reportId: {
      type: String,
      required: [true, 'Report ID is required'],
      ref: 'Report',
    },
    versionNumber: {
      type: Number,
      required: [true, 'Version number is required'],
    },
    snapshotData: {
      type: Schema.Types.Mixed,
      required: [true, 'Snapshot data is required'],
    },
    submittedAt: {
      type: Date,
      default: Date.now,
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
reportVersionSchema.index({ reportId: 1, versionNumber: -1 });

export const ReportVersion = mongoose.model<IReportVersion>(
  'ReportVersion',
  reportVersionSchema
);
