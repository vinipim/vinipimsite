type NotificationPayload = {
  title: string;
  content: string;
};

export async function notifyOwner(payload: NotificationPayload) {
  console.log("[Notification]", payload.title, "-", payload.content);
  // Add email or other notification logic here
}
