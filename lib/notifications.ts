import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import type { NotificationType } from "@/models/Notification";

export async function createNotification(params: {
  userId: string;
  message: string;
  type?: NotificationType;
  link?: string;
}): Promise<void> {
  await connectDB();
  await Notification.create({
    userId: params.userId,
    message: params.message,
    type: params.type ?? "system",
    link: params.link,
    read: false,
  });
}

export interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link: string | null;
  createdAt: string;
}

export async function getNotifications(
  userId: string,
  limit = 20
): Promise<{ items: NotificationItem[]; unread: number }> {
  await connectDB();

  const [docs, unread] = await Promise.all([
    Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean(),
    Notification.countDocuments({ userId, read: false }),
  ]);

  return {
    unread,
    items: docs.map((d) => ({
      id: String(d._id),
      message: d.message,
      type: d.type,
      read: d.read,
      link: d.link ?? null,
      createdAt: new Date(d.createdAt).toISOString(),
    })),
  };
}

/** Mark a single notification (by id) or all of the user's notifications read. */
export async function markNotificationsRead(
  userId: string,
  opts: { id?: string; all?: boolean }
): Promise<void> {
  await connectDB();
  if (opts.all) {
    await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );
    return;
  }
  if (opts.id && opts.id.match(/^[0-9a-fA-F]{24}$/)) {
    await Notification.updateOne(
      { _id: opts.id, userId },
      { $set: { read: true } }
    );
  }
}
