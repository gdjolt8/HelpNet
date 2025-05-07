import connectToDatabase from "@/db";
import Users from "@/models/User";
import bcrypt from 'bcrypt';
import * as jwt from "jsonwebtoken";

interface BodyTypes {
    username: string,
    password: string,
}
export async function POST(request: Request) {
    await connectToDatabase();
    const {username, password}: BodyTypes = await request.json();

    const UserData = await Users.findOne({username: username});
    if (!UserData) {
        return new Response(
            JSON.stringify(
                {
                    ok: false,
                    message: "User account does not exist",
                }
            ), 
            {
                status: 500
            }
        );
    }
    const comparison = await bcrypt.compare(password, UserData.password);
    if (comparison) {
        const token = await jwt.sign({username: UserData.username, email: UserData.email, banned: UserData.banned}, String(process.env.JWT_SECRET));
        return new Response(JSON.stringify(
            {
                ok: true,
                token: token
            }
        ), {
            status: 200
        });
    } else {
        return new Response(
            JSON.stringify(
                {
                    ok: false,
                    message: "Invalid password.",
                }
            ), 
            {
                status: 500
            }
        );        
    }

}