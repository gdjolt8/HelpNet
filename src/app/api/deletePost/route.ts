import connectToDatabase from "@/db";
import { getToken } from "@/lib/functions";
import Notification from "@/models/Notification";
import Posts from "@/models/Post";
import Users from "@/models/User";
import { cookies } from "next/headers";
export async function POST(req: Request) {
  await connectToDatabase();
  const { postId, deleted, reason } = await req.json();
  const cookie = await cookies();
  try {
    const isMod = await getToken(String(cookie.get("authorization")?.value));
    if (isMod.ok == false) return new Response(JSON.stringify({ok: false, message: "Access denied"}), {status: 403});
    
    const post = await Posts.findById(postId);
    const author = await Users.findOne({username: post.author});
    const byAuthor = post.author == isMod.account.username;
    if (isMod.account.admin != true && !byAuthor) return new Response(JSON.stringify({ok: false, message: "Access denied"}), {status: 403});
    await Posts.updateOne({ _id: postId }, { $set: {deleted: deleted, deleted_data: {start_date: new Date(), reason}} });
      // Add notification for the user
    
    if (deleted) {
    if (byAuthor) {
      await Notification.create({
        userId: author._id,
        message: `Your post titled "${post.title}" has been deleted by a moderator, for the reason of ${reason}.`,
        date: new Date(),
        read: false,
      });
    } else {
      await Notification.create({
        userId: author._id,
        message: `You deleted your post titled "${post.title}.`,
        date: new Date(),
        read: false,
      });
    }
  } else {
    await Notification.create({
      userId: author._id,
      message: `Your post titled "${post.title}" has been restored.`,
      date: new Date(),
      read: false,
    });
  }
    const posts = await Posts.find({}).sort({creationDate: -1}).limit(20);
    return new Response(JSON.stringify({ ok: true, message: "Successful", posts: posts }), { status: 200 });
  } catch (e) {
    console.log("Error:", e);
    return new Response(JSON.stringify({ ok: false, message: "Failed to delete post" }), { status: 500 });
  }
}
