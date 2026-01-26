import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { parseJson } from "@/lib/json";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ shareId: string }> }
) {
    try {
        const { shareId } = await params;

        const share = await prisma.share.findUnique({
            where: { shareId },
            include: {
                topic: {
                    include: {
                        nodes: {
                            include: {
                                contents: true
                            }
                        }
                    }
                }
            },
        });

        if (!share) {
            return NextResponse.json({ error: "Share not found" }, { status: 404 });
        }

        // Parse JSON strings back for Frontend
        const parsedTopic = {
            ...share.topic,
            nodes: share.topic.nodes.map((node: any) => ({
                ...node,
                contents: node.contents.map((c: any) => ({
                    ...c,
                    imagePrompt: c.imagePrompt,
                    flowchart: parseJson(c.flowchart, []),
                    keyPoints: parseJson(c.keyPoints, []),
                    examples: parseJson(c.examples, []),
                    misconceptions: parseJson(c.misconceptions, null),
                    faq: parseJson(c.faq, null),
                    nextConcepts: parseJson(c.nextConcepts, null),
                    visualGrid: parseJson(c.visualGrid, []),
                    quizData: parseJson(c.quizData, []),
                }))
            }))
        };

        return NextResponse.json({ ...share, topic: parsedTopic });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
