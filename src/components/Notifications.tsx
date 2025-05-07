"use client";
import { useEffect, useState } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string; // ISO date string
  read: boolean;
}

const Notifications = ({ fetchNotifications }: { fetchNotifications: () => Promise<Notification[]> }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/markNotificationAsRead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification
          )
        );
      } else {
        console.error("Failed to mark notification as read");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading notifications...</p>;
  }

  if (notifications.length === 0) {
    return <p className="text-gray-500">No notifications available</p>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Notifications</h2>
      <ul className="space-y-2">
        {notifications.slice(0, 3).map((notification) => (
          <li
            key={notification.id}
            className={`p-3 border rounded-lg ${
              notification.read ? "bg-gray-100" : "bg-blue-50"
            }`}
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium text-black">{notification.title}</h3>
                <p className="text-sm text-gray-600">{notification.message}</p>
              </div>
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Mark as Read
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(notification.timestamp).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
