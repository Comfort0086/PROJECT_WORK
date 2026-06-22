import mongoose, { Schema, model, models, type Model } from "mongoose";

export type ApplicationStatus =
  | "pending"
  | "reviewed"
  | "accepted"
  | "rejected";

export interface IApplication {
  _id: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId; // ref User (role: student)
  opportunityId: mongoose.Types.ObjectId; // ref Opportunity
  status: ApplicationStatus;
  coverNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    opportunityId: {
      type: Schema.Types.ObjectId,
      ref: "Opportunity",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending",
    },
    coverNote: { type: String },
  },
  { timestamps: true }
);

// A student can apply to a given opportunity only once.
ApplicationSchema.index({ studentId: 1, opportunityId: 1 }, { unique: true });

export const Application: Model<IApplication> =
  (models.Application as Model<IApplication>) ||
  model<IApplication>("Application", ApplicationSchema);
