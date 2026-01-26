import { prisma } from "@/lib/prisma";
import { Mode } from "@/lib/openai";
import { generateNodeContent } from "@/lib/llm";
import { NextResponse } from "next/server";
import { stringifyJson, parseJson } from "@/lib/json";


export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const mode = body.mode as Mode;

        const node = await prisma.node.findUnique({
            where: { id },
            include: { topic: true }
        });

        if (!node) {
            return NextResponse.json({ error: "Node not found" }, { status: 404 });
        }

        // Check if content exists in cache
        const existingContent = await prisma.nodeContent.findFirst({
            where: { nodeId: node.id, mode }
        });

        if (existingContent) {
            console.log(`[Cosmic Sync] Node content found in cache: ${node.title}`);
            return NextResponse.json({
                ...existingContent,
                provider: "cache",
                flowchart: parseJson(existingContent.flowchart, []),
                keyPoints: parseJson(existingContent.keyPoints, []),
                examples: parseJson(existingContent.examples, []),
                misconceptions: parseJson(existingContent.misconceptions, []),
                faq: parseJson(existingContent.faq, []),
                nextConcepts: parseJson(existingContent.nextConcepts, []),
                visualGrid: parseJson(existingContent.visualGrid, []),
                quizData: parseJson(existingContent.quizData, []),
            });
        }

        console.log(`[Cosmic Sync] Calibrating: ${node.title}`);
        const content = await generateNodeContent({
            query: node.topic.query,
            nodeTitle: node.title,
            mode
        });

        const summary = content?.summary || "Transmission data incomplete.";

        // Cleanup old entries first
        await prisma.nodeContent.deleteMany({
            where: { nodeId: node.id, mode }
        });

        let createdContent;
        try {
            // Attempt 1: Full Visual Experience (with visualGrid and quizData)
            console.log("[Cosmic Sync] Attempting Full Reconstruction...");
            createdContent = await (prisma.nodeContent as any).create({
                data: {
                    nodeId: node.id,
                    mode,
                    summary,
                    keyPoints: stringifyJson(content?.key_points || []),
                    examples: stringifyJson(content?.examples || []),
                    imagePrompt: content?.image_prompt || null,
                    flowchart: stringifyJson(content?.visual_flowchart || []),
                    misconceptions: stringifyJson(content?.misconceptions || []),
                    faq: stringifyJson(content?.faq || []),
                    nextConcepts: stringifyJson(content?.next_concepts || []),
                    visualGrid: stringifyJson(content?.visual_grid || []),
                    quizData: stringifyJson(content?.interactive_quiz || []),
                }
            });
        } catch (e: any) {
            // Attempt 2: Minimalist Fallback (No visualGrid/quizData if Prisma Client is stale)
            console.warn("[Cosmic Sync Warning] Stale Schema detected. Falling back to Core Reconstruction.");
            createdContent = await prisma.nodeContent.create({
                data: {
                    nodeId: node.id,
                    mode,
                    summary,
                    keyPoints: stringifyJson(content?.key_points || []),
                    examples: stringifyJson(content?.examples || []),
                    imagePrompt: content?.image_prompt || null,
                    flowchart: stringifyJson(content?.visual_flowchart || []),
                    misconceptions: stringifyJson(content?.misconceptions || []),
                    faq: stringifyJson(content?.faq || []),
                    nextConcepts: stringifyJson(content?.next_concepts || []),
                }
            } as any);
        }

        return NextResponse.json({
            ...createdContent,
            flowchart: parseJson(createdContent.flowchart, []),
            keyPoints: parseJson(createdContent.keyPoints, []),
            examples: parseJson(createdContent.examples, []),
            misconceptions: parseJson(createdContent.misconceptions, []),
            faq: parseJson(createdContent.faq, []),
            nextConcepts: parseJson(createdContent.nextConcepts, []),
            visualGrid: parseJson(createdContent.visualGrid, []),
            quizData: parseJson(createdContent.quizData, []),
        });

    } catch (error: any) {
        console.error("[Cosmic Trace Critical]:", error);
        return NextResponse.json({
            error: "The knowledge signal was too fragmented to reconstruct.",
            details: error.message
        }, { status: 500 });
    }
}
