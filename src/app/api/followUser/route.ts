import connectToDatabase from "@/db";
import { getToken } from "@/lib/functions";
import Notification from "@/models/Notification";
import Users from "@/models/User";
import { cookies } from "next/headers";
export async function POST(req: Request) {
  await connectToDatabase();
  const { userId } = await req.json();
  const cookie = await cookies();
  try {
    const session = await getToken(String(cookie.get("authorization")?.value));
    if (session.ok == false) return new Response(JSON.stringify({ ok: false, message: "Failed to follow" }), { status: 400 });
    const author = await Users.findById(userId);
    let follow = true;
    if (!session.account.following.some((item: {username: string, id: string, _id: string}) => item.id === userId)) {
        await Users.findByIdAndUpdate(userId, {$push: {followers: {username: session.account.username, id: session.account._id}}});
        await Users.findByIdAndUpdate(session.account._id, {$push: {following: {username: author.username, id: userId}}});
    } else {
        follow = false;
        await Users.findByIdAndUpdate(userId, {$pull: {followers: {username: session.account.username, id: session.account._id}}});
        await Users.findByIdAndUpdate(session.account._id, {$pull: {following: {username: author.username, id: userId}}});
    }
    
    
    if (follow) {
    await Notification.create({
      userId: author._id,
      message: `${session.account.username} has followed you`,
      date: new Date(),
      read: false,
    });
    } else {
      await Notification.create({
        userId: author._id,
        message: `${session.account.username} has unfollowed you`,
        date: new Date(),
        read: false,
      });
    } 
    return new Response(JSON.stringify({ ok: true, message: "Successful", isFollowing: follow}), { status: 200 });
  } catch (e) {
    console.log("Error:", e);
    return new Response(JSON.stringify({ ok: false, message: "Failed to follow" }), { status: 500 });
  }
}
