import { NextRequest, NextResponse } from "next/server";
import Post from "@/models/Post"; // Assume this is the Tweet model from Mongoose
import connectToDatabase from "@/db";
import Users from "@/models/User";



export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();

    // Ensure database connection
    await connectToDatabase();

    // Validate required fields
    const { title, description, content, images, links, user, follower_only } = body;
    const userAcc = await Users.findOne({username: user});
    if (!content || !user) {
      return NextResponse.json(
        { error: "Content and user are required" },
        { status: 400 }
      );
    }

    // Create a new tweet document
    const newPost = await Post.create({
      title,
      description,
      creationDate: new Date(),
      content,
      images,
      links,
      author: user,
      views: 0,
      likes: [],
      replies: [],
      follower_only,
      reports: [],
    });

    await Users.findByIdAndUpdate(userAcc._id, {$push: {posts: {title, description, id: newPost._id}}})

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Error creating tweet:", error);
    return NextResponse.json({ error: "Failed to create tweet" }, { status: 500 });
  }
}
