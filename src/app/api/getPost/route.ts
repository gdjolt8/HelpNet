import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/db";
import Posts from "@/models/Post";



export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();

    // Ensure database connection
    await connectToDatabase();

    // Validate required fields
    const { postId } = body;
    const res = await Posts.findById(postId);
    return new Response(JSON.stringify({ ok: true, post: res }), { status: 200 });
  } catch (error) {
    console.error("Error viewing:", error);
    return NextResponse.json({ ok: false, error: "Failed to view" }, { status: 500 });
  }
}
