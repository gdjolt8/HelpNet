import mongoose from "mongoose";

export type NotificationType = {
    _id: string;
    userId: string;
    message: string;
    createdAt: Date;
    read: boolean;
}
const notificationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
  });
  
const Notification = mongoose.models.Notifications || mongoose.model("Notifications", notificationSchema);
export default Notification;  