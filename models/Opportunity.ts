import mongoose, { Schema, model, models, type Model } from "mongoose";

export type OpportunityStatus = "open" | "closed";

export interface IOpportunity {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId; // ref User (role: company)
  title: string;
  description: string;
  location?: string;
  duration?: string;
  slotsAvailable?: number;
  skillsRequired: string[];
  status: OpportunityStatus;
  startDate?: Date;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OpportunitySchema = new Schema<IOpportunity>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, trim: true },
    duration: { type: String, trim: true },
    slotsAvailable: { type: Number, min: 1, default: 1 },
    skillsRequired: { type: [String], default: [] },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    startDate: { type: Date },
    deadline: { type: Date },
  },
  { timestamps: true }
);

export const Opportunity: Model<IOpportunity> =
  (models.Opportunity as Model<IOpportunity>) ||
  model<IOpportunity>("Opportunity", OpportunitySchema);
