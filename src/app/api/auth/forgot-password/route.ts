import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        console.log("Searching for user:", email);
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Return success even if user not found to prevent enumeration
            return NextResponse.json({ message: "If an account exists, an OTP has been sent." });
        }

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        console.log("Updating user with OTP (Raw SQL)...");
        // Use raw query to bypass stale Prisma Client validation without server restart
        await prisma.$executeRaw`UPDATE "User" SET "resetToken" = ${otp}, "resetTokenExpiry" = ${expiry.toISOString()} WHERE "email" = ${email}`;

        // MOCK EMAIL SENDING
        console.log("=================================");
        console.log(`[Didactic System] OTP for ${email}: ${otp}`);
        console.log("=================================");

        // In a real app, use nodemailer here
        // await sendEmail(email, "Password Reset OTP", `Your OTP is ${otp}`);

        return NextResponse.json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ error: `Debug Error: ${error instanceof Error ? error.message : "Unknown"}` }, { status: 500 });
    }
}
