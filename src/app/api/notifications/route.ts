import connectToDatabase from "@/db";
import { getToken } from "@/lib/functions";
import Notification, { NotificationType } from "@/models/Notification";

export async function POST(req: Request) {
    await connectToDatabase();
    const {token} = await req.json();
    const user = await getToken(token);
    
    try {
    if (!user.ok) { return new Response(JSON.stringify({ok: false}), {status: 400});}
    const notifications = await Notification.find({ userId: user.account._id }).maxTimeMS(1000);
    const filteredNotifications = notifications.filter((notification: NotificationType) => notification.read == false);
    return new Response(JSON.stringify({notifications: filteredNotifications}), {status: 200});
    } catch(e) {
      console.log("Error:", e);
    }
}

export async function PUT(req: Request) {
    await connectToDatabase();
  
    try {
      const { notificationId, token } = await req.json();  // Get notificationId from the body
      const user = await getToken(token);
      if (!user.ok) { return new Response(JSON.stringify({ok: false}), {status: 200});}
      const notPost = await Notification.findById(notificationId);
      if (notPost?.userId != user.account._id) { return new Response(JSON.stringify({ok: false}), {status: 200});}
      const notification = await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
      if (!notification) {
        return new Response(JSON.stringify({ message: "Notification not found" }), {status: 404});
      }
  
      return new Response(JSON.stringify({ notification }), {status: 200});
    } catch (error) {
      console.error("Error updating notification:", error);
      return new Response(JSON.stringify({ message: "Failed to update notification" }), {status: 500});
    }
  }