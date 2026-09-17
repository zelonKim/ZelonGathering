import { client } from "../client";

export const deleteNotification = async (notificationId: string): Promise<void> => {
  await client.delete(`/users/notifications/${notificationId}`);
};