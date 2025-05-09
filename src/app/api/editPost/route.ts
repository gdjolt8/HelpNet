import { NextResponse } from "next/server";
import connectToDatabase from "@/db";
import Posts from "@/models/Post";
import { getToken } from "@/lib/functions";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const {authorization, new_post, post_id} = await req.json();

    const token = (await getToken(authorization)).account;
    if (token) {
        await Posts.findByIdAndUpdate(post_id, {$set: {content: new_post}});
    } else {
        return new Response(JSON.stringify({ok: false, message: "Access Denied."}), {status: 400});
    }
    const Post = await Posts.findById(post_id);
    return new Response(JSON.stringify({ok: true, content: Post.content}), {headers: {"Content-Type": "application/json"}, status: 200});
  } catch (error) {
    console.error("Error creating tweet:", error);
    return NextResponse.json({ error: "Failed to create tweet" }, { status: 500 });
  }
}
