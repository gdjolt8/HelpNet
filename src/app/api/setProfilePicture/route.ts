import connectToDatabase from '@/db';
import Users from '@/models/User';
import {  getToken } from '@/lib/functions';

export async function POST(request: Request) {
  await connectToDatabase();
  const { authorization, image_url} = await request.json();
  const auth = (await getToken(authorization)).account;
  try {
    const user = await Users.findOne({username: auth.username});
    if (user) {
        console.log("updating " + user.username);
        await Users.findOneAndUpdate({username: user.username}, {$set: {profile_picture_url: image_url}});
    } else {
        return new Response(JSON.stringify({message: "Access denied", ok: false}), {status: 400});
    }
    return new Response(JSON.stringify({ok: true}), {status: 200});
  } catch (error) {
    const err = error;
    console.error('Error during account creation:', error);
    return new Response(
      JSON.stringify({
        ok: false,
        message: 'Unexpected server error: ' + err,
      }),
      { status: 500 }
    );
  }
}
