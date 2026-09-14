import { client } from "../client";
import type { NotificationItem } from "../../types/NotificationItem";

export const getMyNotifications = async (): Promise<NotificationItem[]> => {
  const { data } = await client.get<NotificationItem[]>("/users/notifications");
  return data;
};
