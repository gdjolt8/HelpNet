import { NextResponse } from "next/server";
import Post from "@/models/Post"; // Assume this is the Tweet model from Mongoose
import connectToDatabase from "@/db";



export async function GET() {
  try {
    await connectToDatabase();

    const Posts = await Post.find({}).sort({creationDate: -1});
    return new Response(JSON.stringify(Posts), {headers: {"Content-Type": "application/json"}, status: 200});
  } catch (error) {
    console.error("Error creating tweet:", error);
    return NextResponse.json({ error: "Failed to create tweet" }, { status: 500 });
  }
}
