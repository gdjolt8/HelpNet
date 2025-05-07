import connectToDatabase from '@/db';
import * as jwt from 'jsonwebtoken';
import Users from '@/models/User';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { getGeoData } from '@/lib/functions';

interface BodyTypes {
  username: string;
  password: string;
  email: string;
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit numeric code
}

async function sendVerificationEmail(
  email: string, 
  code: string, 
  ip: string, 
  country: string, 
  region: string,
  long: string,
  lat: string,
  state: string,
) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "helpnet.mailer@gmail.com",
      pass: "btnmbvptmkojaniv", // App password or email password
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: '"HelpNet" <helpnet.mailer@gmail.com>',
    to: email,
    subject: 'Verify Your HelpNet Account',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 16px;">
        <h2 style="text-align: center; color: #4CAF50;">Welcome to HelpNet!</h2>
        <p>Hi there,</p>
        <p>We're thrilled to have you on board! To complete your registration, please use the verification code below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; color: #4CAF50; padding: 10px 20px; border: 1px solid #4CAF50; border-radius: 5px; display: inline-block;">
            ${code}
          </span>
        </div>
        <p>For your security, here are the details of the request:</p>
        <ul style="list-style-type: none; padding: 0;">
          <li><strong>IP Address:</strong> ${ip}</li>
          <li><strong>Country:</strong> ${country}</li>
          <li><strong>State:</strong> ${state}</li>
          <li><strong>Region:</strong> ${region}</li>
          <li><strong>Latitude:</strong> ${lat}</li>
          <li><strong>Longitude:</strong> ${long}</li>
        </ul>
        <p>If this wasn’t you, please ignore this email, and your account won’t be activated.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="text-align: center; color: #888; font-size: 14px;">
          HelpNet
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}


export async function POST(request: Request) {
  await connectToDatabase();
  const { username, password, email }: BodyTypes = await request.json();
  const plainTextPassword = password;
  const ip = request.headers.get("x-forwarded-for") || "Unknown IP";

  const geoData = await getGeoData(ip) || { country: "Unknown", region: "Unknown" };
  const { country, state, latitude, longitude, region } = geoData;

  const token = await jwt.sign(
    { username: username, email: email, banned: false },
    String(process.env.JWT_SECRET)
  );

  try {
    const now = Date.now();
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plainTextPassword, salt);

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Send verification email with additional details

    // Create the user in the database with unverified status
    const user = await Users.create({
      username: username,
      password: hash,
      email: email,
      creation_date: now,
      admin: false,
      banned: false,
      verified: false, 
      verification_code: verificationCode,
      country: country,
      region: region,
      ip: ip,
      posts: [],
      followers: [],
      following: [],
      replies: [],
      profile_picture_url: '/default-avatar.png',
      banned_data: {
        reason: '',
        start_date: new Date(0),
        end_date: new Date(0),
      },
    });

    await sendVerificationEmail(email, verificationCode, ip, country, region, longitude, latitude, state);

    await Users.findOneAndUpdate({ username: 'HelpNet' }, { $push: { followers: {username: user.username, id: user._id} } });

    const response = {
      ok: true,
      message: 'Successfully created account! Please check your email for a verification code.',
      token: token,
    };

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    const err = error as { code?: number | undefined };
    if (err.code === 11000) {
      return new Response(
        JSON.stringify({
          ok: false,
          message: 'Username or email already taken.',
        }),
        { status: 400 }
      );
    }
    console.error('Error during account creation:', error);
    return new Response(
      JSON.stringify({
        ok: false,
        message: 'Unexpected server error.',
      }),
      { status: 500 }
    );
  }
}
