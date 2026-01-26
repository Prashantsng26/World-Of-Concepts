import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { parseJson } from "@/lib/json";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { nodeId } = await req.json();

        const bookmark = await prisma.bookmark.upsert({
            where: {
                userId_nodeId: {
                    userId: (session.user as any).id as string,
                    nodeId,
                },
            },
            update: {},
            create: {
                userId: (session.user as any).id as string,
                nodeId,
            },
        });

        return NextResponse.json(bookmark);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const bookmarks = await prisma.bookmark.findMany({
            where: { userId: (session.user as any).id as string },
            include: {
                node: {
                    include: {
                        topic: true,
                        contents: true,
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        });

        const parsedBookmarks = bookmarks.map((b: any) => ({
            ...b,
            node: {
                ...b.node,
                contents: b.node.contents.map((c: any) => ({
                    ...c,
                    imagePrompt: c.imagePrompt,
                    flowchart: parseJson(c.flowchart, []),
                    keyPoints: parseJson(c.keyPoints, []),
                    examples: parseJson(c.examples, []),
                    misconceptions: parseJson(c.misconceptions, null),
                    faq: parseJson(c.faq, null),
                    nextConcepts: parseJson(c.nextConcepts, null),
                }))
            }
        }));

        return NextResponse.json(parsedBookmarks);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
