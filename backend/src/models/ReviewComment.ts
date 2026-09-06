import mongoose, { Schema } from 'mongoose';
import { IReviewComment, ReviewAction } from '../types';

const reviewCommentSchema = new Schema<IReviewComment>(
  {
    reportId: {
      type: String,
      required: [true, 'Report ID is required'],
      ref: 'Report',
    },
    reviewerId: {
      type: String,
      required: [true, 'Reviewer ID is required'],
      ref: 'User',
    },
    versionNumber: {
      type: Number,
      required: [true, 'Version number is required'],
    },
    action: {
      type: String,
      enum: Object.values(ReviewAction),
      required: [true, 'Review action is required'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
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
reviewCommentSchema.index({ reportId: 1, createdAt: -1 });
reviewCommentSchema.index({ reviewerId: 1 });

export const ReviewComment = mongoose.model<IReviewComment>(
  'ReviewComment',
  reviewCommentSchema
);
