import { NextResponse } from "next/server";
import connectToDatabase from "@/db";
import Users from "@/models/User";

export type PublicUserInfo = {
    username: string;
    profile_picture_url: string | undefined;
    followers: string[];
    following: string[];
    admin: boolean;
    creation_date: number;
    country: string;
    _id: string;
};

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const {username} = await req.json();

    const User = await Users.findOne({username: username});
    const json = {_id: User._id, username: User.username, creation_date: User.creation_date, country: String, profile_picture_url: User.profile_picture_url, followers: User.followers, following: User.following, admin: User.admin};
    return new Response(JSON.stringify({user: json}), {headers: {"Content-Type": "application/json"}, status: 200});
  } catch (error) {
    console.error("Error creating tweet:", error);
    return NextResponse.json({ error: "Failed to create tweet" }, { status: 500 });
  }
}
