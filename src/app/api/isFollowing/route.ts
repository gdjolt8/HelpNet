import { NextResponse } from "next/server";
import connectToDatabase from "@/db";
import Users from "@/models/User";

function checkIfFollowed(arr: {username: string, id: string, _id: string}[], user: string) {
  for (const a of arr) {
    if (a.username == user)
      return true;
  }
  return false;
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const {following, follower} = await req.json();
    if (!following || !follower) return NextResponse.json({ error: "Need both arguments" }, { status: 400 });
    const User = await Users.findOne({username: following});
    const id = await Users.findOne({username: follower});
    const isFollowing = (checkIfFollowed(User.followers, id.username) ? true : false);
    return new Response(JSON.stringify({ok: true, isFollowing: isFollowing}), {headers: {"Content-Type": "application/json"}, status: 200});
  } catch (error) {
    console.error("Error creating tweet:", error);
    return NextResponse.json({ error: "Failed to create tweet" }, { status: 500 });
  }
}
