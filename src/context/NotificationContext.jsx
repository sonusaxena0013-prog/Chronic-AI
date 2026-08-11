import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const NotificationContext = createContext(null);

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: "update",
    icon: "🚀",
    title: "Chronic AI updated",
    message:
      "Chronic AI has received new improvements and performance updates.",
    time: "Just now",
    read: false,
  },
  {
    id: 2,
    type: "success",
    icon: "✓",
    title: "Welcome to Chronic AI",
    message:
      "Your workspace is ready. Start a new conversation whenever you want.",
    time: "2 min ago",
    read: false,
  },
  {
    id: 3,
    type: "feature",
    icon: "✨",
    title: "New features available",
    message:
      "More AI capabilities and improvements are coming to Chronic AI.",
    time: "1 hour ago",
    read: true,
  },
  {
    id: 4,
    type: "info",
    icon: "i",
    title: "Tip",
    message:
      "You can use the prompt bar to upload documents and images.",
    time: "Today",
    read: true,
  },
];

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(
    INITIAL_NOTIFICATIONS
  );

  const [isNotificationOpen, setIsNotificationOpen] =
    useState(false);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const openNotifications = useCallback(() => {
    setIsNotificationOpen(true);
  }, []);

  const closeNotifications = useCallback(() => {
    setIsNotificationOpen(false);
  }, []);

  const toggleNotifications = useCallback(() => {
    setIsNotificationOpen((previous) => !previous);
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isNotificationOpen,
      openNotifications,
      closeNotifications,
      toggleNotifications,
      markAsRead,
      markAllAsRead,
    }),
    [
      notifications,
      unreadCount,
      isNotificationOpen,
      openNotifications,
      closeNotifications,
      toggleNotifications,
      markAsRead,
      markAllAsRead,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }

  return context;
}