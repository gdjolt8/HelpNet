import { useEffect, useState } from "react";
import { NotificationType } from "@/models/Notification"; // Assuming you've exported NotificationType
import Cookies from "js-cookie"; // To retrieve the current user token
import { useRouter } from "next/navigation";
import { User } from "@/models/User";
import { getToken } from "@/lib/functions";
import Link from "next/link";

const Sidebar = ({ username }: { username: string | undefined }) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = Cookies.get("authorization");
        if (!token) {
          router.push("/login"); // Redirect to login if no token found
          return;
        }

        const userVerification = await getToken(token);
        setUser(userVerification.account);

        // Fetch notifications for the logged-in user)
        const res = await fetch(`/api/notifications`, { method: "POST", body: JSON.stringify({ token }) });
        const data = await res.json();
        console.log(userVerification.account);
        setNotifications(data.notifications); // Update notifications state
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [router]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId, token: String(Cookies.get("authorization")) }),
      });

      if (res.ok) {
        setNotifications(notifications.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        ));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <aside className="w-1/4 bg-white p-4 border-r">
      <h1 className="text-3xl font-bold text-blue-600">HelpNet</h1>
      <p className="mt-4 text-gray-600">Welcome, {username || "Guest"}!</p>

      {/* Notifications Button */}
      <div className="relative mt-4">
        <button className="flex items-center gap-2 w-full p-2 rounded bg-blue-600 text-white hover:bg-blue-700">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
          <span>Notifications {notifications.length}</span>
        </button>
        {notifications.length > 0 && (
          <span
            className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold rounded-full px-2 py-1"
            style={{ transform: "translate(50%, -50%)" }}
          >
            {notifications.length}
          </span>
        )}
      </div>

      {/* Notifications Dropdown */}
      {notifications.length > 0 && (
        <div className="mt-4 bg-gray-100 p-4 rounded">
          <h3 className="text-lg font-semibold py-1">Notifications</h3>
          <ul>
            {notifications.slice(notifications.length - 3, notifications.length).map((notification) => (
              <li
                key={notification._id}
                className={`p-2 ${notification.read ? "bg-gray-200" : "bg-blue-100"} mb-2`}
              >
                <p className="text-black">{notification.message}</p>
                <button
                  onClick={() => markAsRead(notification._id)}
                  className={`mt-2 text-xs ${notification.read ? "text-gray-500" : "text-blue-600"}`}
                >
                  {notification.read ? "Read" : "Mark as Read"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <nav className="mt-8 space-y-2">
        <button className="block w-full text-left p-2 rounded hover:bg-gray-200">Home</button>
        <button className="block w-full text-left p-2 rounded hover:bg-gray-200">Explore</button>
        {user?.admin && (
          <Link
            className="block w-full text-left p-2 rounded hover:bg-gray-200 hover:underline"
            href="/modPanel"
          >
            Moderation Panel
          </Link>
        )}
        <Link href="/logout" className="block w-full text-left p-2 rounded hover:bg-gray-200">Logout</Link>
        <Link href={`/profile?user=${user?.username}`} className="block w-full text-left p-2 rounded hover:bg-gray-200">Profile</Link>
        <Link href={`/settings`} className="block w-full text-left p-2 rounded hover:bg-gray-200">Settings</Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
