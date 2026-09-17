import type { NotificationItem } from "../../../types/NotificationItem";
import { client } from "../client";

export const getMyNotifications = async (): Promise<NotificationItem[]> => {
  const { data } = await client.get<NotificationItem[]>("/users/notifications");
  return data;
};
