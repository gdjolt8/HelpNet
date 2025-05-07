import connectToDatabase from "@/db";
import { getToken } from "@/lib/functions";
import User from "@/models/User";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  await connectToDatabase();

  const { userId, reason } = await req.json();
  const cookie = await cookies();

  try {
    // Validate Moderator/Admin Permissions
    const isMod = await getToken(String(cookie.get("authorization")?.value));
    if (!isMod.ok) {
      return new Response(
        JSON.stringify({ ok: false, message: "Access denied" }),
        { status: 403 }
      );
    }
    if (!isMod.account.admin) {
      return new Response(
        JSON.stringify({ ok: false, message: "Access denied" }),
        { status: 403 }
      );
    }
    const user = await User.findById(userId);
    
    // Ban the user
    if(user.banned) await User.findByIdAndUpdate(userId, { banned: false, banned_data: { reason, start_date: new Date(), end_date: new Date(),}});
    else await User.findByIdAndUpdate(userId, { banned: true, banned_data: { reason, start_date: new Date(), end_date: new Date(new Date().getTime()+1000*60*60*24*7*100000000),}});
    return new Response(
      JSON.stringify({ ok: true, message: "User banned successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error banning user:", error);
    return new Response(
      JSON.stringify({ ok: false, message: "Failed to ban user" }),
      { status: 500 }
    );
  }
}

