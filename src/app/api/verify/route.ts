import connectToDatabase from '@/db';
import User from '@/models/User';
import * as jwt from 'jsonwebtoken';

interface BodyTypes {
    token: string,
};

export async function POST(request: Request) {
    await connectToDatabase();
    const { token }: BodyTypes = await request.json();
    let response = { ok: false, account: null };

    // Use a promise wrapper around jwt.verify to handle async properly
    const verifyToken = new Promise((resolve, reject) => {
        jwt.verify(token, String(process.env.JWT_SECRET), (err, decoded) => {
            if (err) {
                reject(err); // Reject if there's an error
            } else {
                resolve(decoded); // Resolve with decoded data if no error
            }
        });
    });

    try {
        // Wait for the JWT verification
        const decoded = await verifyToken;

        if (decoded) {
            const user = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8'));
            // Fetch the user from the database
            const UserModel = await User.findOne({ username: user["username"] });

            return new Response(JSON.stringify({
                ok: true,
                account: UserModel
            }), { status: 200 });
        }
    } catch {
        response = {
            ok: false,
            account: null
        };
    }

    // If it reaches here, it means verification failed or no valid user found
    return new Response(JSON.stringify(response), { status: 200 });
}
