import { prisma } from "@/lib/prisma";
import { Mode } from "@/lib/openai";
import { expandNode } from "@/lib/llm";
import { NextResponse } from "next/server";
import { stringifyJson, parseJson } from "@/lib/json";


export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { mode } = body as { mode: Mode };

        const parentNode = await prisma.node.findUnique({
            where: { id },
            include: {
                topic: true,
                children: {
                    include: { contents: true }
                }
            }
        });

        if (!parentNode) {
            return NextResponse.json({ error: "Node not found" }, { status: 404 });
        }

        // Check if already expanded
        if (parentNode.children.length > 0) {
            console.log(`[Cosmic Sync] Returning existing expansion for: ${parentNode.title}`);
            const parsedNodes = parentNode.children.map((node: any) => ({
                ...node,
                contents: node.contents.map((c: any) => ({
                    ...c,
                    flowchart: parseJson(c.flowchart, []),
                    keyPoints: parseJson(c.keyPoints, []),
                    examples: parseJson(c.examples, []),
                    visualGrid: parseJson((c as any).visualGrid, []),
                    quizData: parseJson((c as any).quizData, []),
                }))
            }));
            return NextResponse.json(parsedNodes);
        }

        console.log(`[Cosmic Sync] Spawning universes from: ${parentNode.title}`);
        const data = await expandNode({
            query: parentNode.topic.query,
            nodeTitle: parentNode.title,
            mode
        });

        if (!data.nodes || !Array.isArray(data.nodes)) {
            throw new Error("Invalid structure from AI: missing nodes array");
        }

        const createdNodes = await Promise.all(
            data.nodes.map(async (nodeAi: any, index: number) => {
                const content = nodeAi.content;

                // Skeleton creation first
                const newNode = await prisma.node.create({
                    data: {
                        topicId: parentNode.topicId,
                        parentId: parentNode.id,
                        title: nodeAi.title || "Untitled Intelligence",
                        depth: parentNode.depth + 1,
                        orderIndex: index,
                    }
                });

                if (content) {
                    try {
                        // Attempt Full Visual content
                        await (prisma.nodeContent as any).create({
                            data: {
                                nodeId: newNode.id,
                                mode,
                                summary: content.summary || "No data.",
                                keyPoints: stringifyJson(content.key_points || []),
                                examples: stringifyJson(content.examples || []),
                                imagePrompt: content.image_prompt || null,
                                flowchart: stringifyJson(content.visual_flowchart || []),
                                visualGrid: stringifyJson(content.visual_grid || []),
                                quizData: stringifyJson(content.interactive_quiz || []),
                            }
                        });
                    } catch (e) {
                        // Fallback Core content
                        await prisma.nodeContent.create({
                            data: {
                                nodeId: newNode.id,
                                mode,
                                summary: content.summary || "No data.",
                                keyPoints: stringifyJson(content.key_points || []),
                                examples: stringifyJson(content.examples || []),
                                imagePrompt: content.image_prompt || null,
                                flowchart: stringifyJson(content.visual_flowchart || []),
                            }
                        } as any);
                    }
                }

                return prisma.node.findUnique({
                    where: { id: newNode.id },
                    include: { contents: true }
                });
            })
        );

        const parsedNodes = createdNodes.map((node: any) => ({
            ...node,
            contents: node.contents.map((c: any) => ({
                ...c,
                flowchart: parseJson(c.flowchart, []),
                keyPoints: parseJson(c.keyPoints, []),
                examples: parseJson(c.examples, []),
                visualGrid: parseJson((c as any).visualGrid, []),
                quizData: parseJson((c as any).quizData, []),
            }))
        }));

        return NextResponse.json(parsedNodes);
    } catch (error: any) {
        console.error("[Cosmic Trace Critical - Expansion]:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
