import connectToDatabase from "@/db";
import { getToken } from "@/lib/functions";

export async function POST(req: Request) {
  await connectToDatabase();
  const { token } = await req.json();
  try {
    const user = await getToken(token);
    console.log(user);
    if (!user.ok || !user.account.admin) {
      return new Response(
        JSON.stringify({ isAdmin: false, message: "Access denied" }),
        { status: 403 }
      );
    }

    return new Response(JSON.stringify({ isAdmin: true }), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ isAdmin: false }), { status: 500 });
  }
}
