import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS,
  },
});

export const auth: any = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.APP_URL!],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

        const info = await transporter.sendMail({
          from: '"Prisma Blog" <prisma@example.com>',
          to: user.email,
          subject: "Verify Your Email",
          html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px 20px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        
        <div style="background: #111827; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">Prisma Blog</h1>
        </div>

        <div style="padding: 40px 30px;">
          <h2 style="color: #111827; margin-bottom: 20px;">
            Verify Your Email
          </h2>

          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Thanks for signing up. Please verify your email address by clicking the button below.
          </p>

          <div style="text-align: center; margin: 35px 0;">
            <a 
              href="${verificationUrl}"
              style="
                background: #2563eb;
                color: #ffffff;
                padding: 14px 28px;
                text-decoration: none;
                border-radius: 8px;
                display: inline-block;
                font-weight: bold;
              "
            >
              Verify Email
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>

          <p style="word-break: break-all; font-size: 14px; color: #2563eb;">
            ${verificationUrl}
          </p>

          <p style="color: #9ca3af; font-size: 13px; margin-top: 30px;">
            If you did not create an account, you can safely ignore this email.
          </p>
        </div>

      </div>
    </div>
  `,
        });
        console.log("Message sent: %s", info.messageId);
      } catch (error) {
        console.error("Error sending email:", error);
        throw error;
      }
    },
  },
  socialProviders: {
    google: {
      accessType: "offline",
      prompt: "select_account consent",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
