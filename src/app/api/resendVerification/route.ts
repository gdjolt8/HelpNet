import Users from "@/models/User";
import nodemailer from 'nodemailer';
import { getGeoData } from "@/lib/functions";
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
    const { email } = await request.json();
    
    // Ensure the email exists in the database
    const user = await Users.findOne({ email });
    if (!user) {
      return new Response(
        JSON.stringify({ ok: false, message: "User not found." }),
        { status: 404 }
      );
    }
  
    // Generate a new verification code
    const newVerificationCode = generateVerificationCode();
  
    // Send the verification email
    const ip = request.headers.get("x-forwarded-for") || "Unknown IP";
    const geoData = await getGeoData(ip) || { country: "Unknown", region: "Unknown" };
    const { country, state, latitude, longitude, region } = geoData;
  
    await sendVerificationEmail(
      email,
      newVerificationCode,
      ip,
      country,
      region,
      longitude,
      latitude,
      state
    );
  
    // Update the user with the new verification code
    user.verification_code = newVerificationCode;
    await user.save();
  
    return new Response(
      JSON.stringify({ ok: true, message: "Verification code resent." }),
      { status: 200 }
    );
  }
  