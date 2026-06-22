import mongoose, { Schema, model, models, type Model } from "mongoose";

export type UserRole = "student" | "company" | "admin";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  role: UserRole;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;

  // Student fields
  matricNo?: string;
  university?: string;
  department?: string;
  level?: string;
  cvUrl?: string;

  // Company fields
  companyWebsite?: string;
  companyAddress?: string;
  industry?: string;
  verified?: boolean; // admin approves companies before they can post

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    role: {
      type: String,
      enum: ["student", "company", "admin"],
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },

    // Student
    matricNo: { type: String, trim: true },
    university: { type: String, trim: true },
    department: { type: String, trim: true },
    level: { type: String, trim: true },
    cvUrl: { type: String, trim: true },

    // Company
    companyWebsite: { type: String, trim: true },
    companyAddress: { type: String, trim: true },
    industry: { type: String, trim: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  (models.User as Model<IUser>) || model<IUser>("User", UserSchema);
