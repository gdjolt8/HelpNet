import { NextResponse } from "next/server";
import User from "@/models/User"; // Assume this is the Tweet model from Mongoose
import connectToDatabase from "@/db";



export async function GET() {
  try {
    await connectToDatabase();

    const Users = await User.find({});
    return new Response(JSON.stringify(Users), {headers: {"Content-Type": "application/json"}, status: 200});
  } catch (error) {
    console.error("Error creating tweet:", error);
    return NextResponse.json({ error: "Failed to create tweet" }, { status: 500 });
  }
}
