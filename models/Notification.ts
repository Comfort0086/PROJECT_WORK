import mongoose, { Schema, model, models, type Model } from "mongoose";

export type NotificationType = "application" | "status" | "system";

export interface INotification {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // recipient
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string; // optional in-app link to the relevant page
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["application", "status", "system"],
      default: "system",
    },
    read: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true }
);

export const Notification: Model<INotification> =
  (models.Notification as Model<INotification>) ||
  model<INotification>("Notification", NotificationSchema);
