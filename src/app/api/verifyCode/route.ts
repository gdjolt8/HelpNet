import connectToDatabase from "@/db";
import Users from "@/models/User";

export async function POST(request: Request) {
    const { email, code }: { email: string; code: string } = await request.json();
    await connectToDatabase();
  
    const user = await Users.findOne({ email, verification_code: code });
  
    if (!user) {
      return new Response(
        JSON.stringify({ ok: false, message: 'Invalid verification code.' }),
        { status: 400 }
      );
    }
  
    await Users.findOneAndUpdate({ email: email, }, {$set: {verified: true}});
    await Users.findOneAndUpdate({ email: email, }, {$set: {verification_code: null}});
    
    return new Response(
      JSON.stringify({ ok: true, message: 'Email verified successfully!' }),
      { status: 200 }
    );
  }
  