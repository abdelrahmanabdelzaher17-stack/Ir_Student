
type NotificationCallback = (title: string, body: string) => void;

let onShowNotification: NotificationCallback | null = null;

export const notificationService = {
  // تفعيل استقبال الإشعارات داخل التطبيق
  subscribe: (callback: NotificationCallback) => {
    onShowNotification = callback;
  },

  requestPermission: async () => {
    if (!("Notification" in window)) return false;
    const permission = await Notification.requestPermission();
    return permission === "granted";
  },

  send: (title: string, body: string) => {
    // 1. إرسال إشعار داخلي (دائماً يعمل)
    if (onShowNotification) {
      onShowNotification(title, body);
    }

    // 2. إرسال إشعار المتصفح (إذا كان مسموحاً)
    if (Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
        });
      } catch (e) {
        console.warn("Browser notifications blocked by system.");
      }
    }
    return true;
  },

  test: async () => {
    const granted = await notificationService.requestPermission();
    notificationService.send("التلميذ الحديدي", "هذا إشعار تجريبي، الإشعارات تعمل بنجاح!");
    return granted;
  }
};
