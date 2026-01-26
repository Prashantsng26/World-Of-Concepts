import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
    try {
        const { topicId } = await req.json();

        const existingShare = await prisma.share.findFirst({
            where: { topicId },
        });

        if (existingShare) {
            return NextResponse.json(existingShare);
        }

        const shareId = nanoid(10);
        const share = await prisma.share.create({
            data: {
                topicId,
                shareId,
            },
        });

        return NextResponse.json(share);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
