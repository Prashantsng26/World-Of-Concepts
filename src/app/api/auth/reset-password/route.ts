import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { email, otp, newPassword } = await req.json();

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // 1. Fetch user with raw query (returns array)
        const users = await prisma.$queryRaw<any[]>`SELECT * FROM "User" WHERE "email" = ${email}`;
        const user = users[0];

        if (!user || !user.resetToken || !user.resetTokenExpiry) {
            return NextResponse.json({ error: "Invalid request or no pending reset" }, { status: 400 });
        }

        // 2. Validate Token
        if (user.resetToken !== otp) {
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
        }

        // 3. Validate Expiry (SQLite stores dates as strings/numbers, handle parsing)
        const expiryDate = new Date(user.resetTokenExpiry);
        if (new Date() > expiryDate) {
            return NextResponse.json({ error: "OTP expired" }, { status: 400 });
        }

        // 4. Update password (Raw SQL)
        const passwordHash = await bcrypt.hash(newPassword, 10);

        await prisma.$executeRaw`
            UPDATE "User" 
            SET "passwordHash" = ${passwordHash}, "resetToken" = NULL, "resetTokenExpiry" = NULL 
            WHERE "email" = ${email}
        `;

        return NextResponse.json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
