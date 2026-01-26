import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { parseJson } from "@/lib/json";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const topic = await prisma.topic.findUnique({
            where: { slug },
            include: {
                nodes: {
                    orderBy: { orderIndex: "asc" },
                    include: {
                        contents: true
                    }
                }
            },
        });

        if (!topic) {
            return NextResponse.json({ error: "Topic not found" }, { status: 404 });
        }

        // Parse JSON strings back for Frontend
        const parsedTopic = {
            ...topic,
            nodes: topic.nodes.map(node => ({
                ...node,
                contents: node.contents.map(c => ({
                    ...c,
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

        return NextResponse.json(parsedTopic);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
