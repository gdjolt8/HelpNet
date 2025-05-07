import { NextResponse } from "next/server";
import connectToDatabase from "@/db";
import Posts from "@/models/Post";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const {username} = await req.json();

    const posts = await Posts.find({author: username}).sort({creationDate: -1});
    
    return new Response(JSON.stringify({posts}), {headers: {"Content-Type": "application/json"}, status: 200});
  } catch (error) {
    console.error("Error creating tweet:", error);
    return NextResponse.json({ error: "Failed to create tweet" }, { status: 500 });
  }
}
