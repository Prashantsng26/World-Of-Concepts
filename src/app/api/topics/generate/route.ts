import { prisma } from "@/lib/prisma";
import { Mode } from "@/lib/openai";
import { generateTopic } from "@/lib/llm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stringifyJson, parseJson } from "@/lib/json";


export async function POST(req: Request) {
    try {
        const { query, mode } = (await req.json()) as { query: string; mode: Mode };

        if (!query || !mode) {
            return NextResponse.json({ error: "Missing query or mode" }, { status: 400 });
        }

        console.log(`[Cosmic Sync] Generating universe for: ${query}`);

        // Check if this topic exists in cache
        const existingTopic = await prisma.topic.findFirst({
            where: {
                query: query,
                mode: mode,
                status: "COMPLETED"
            },
            include: {
                nodes: {
                    orderBy: { orderIndex: "asc" },
                    include: { contents: true }
                }
            }
        });

        if (existingTopic && (existingTopic as any).nodes) {
            console.log(`[Cosmic Sync] Universe found in cache: ${query}`);
            return NextResponse.json({
                ...existingTopic,
                provider: "cache",
                nodes: (existingTopic as any).nodes.map((node: any) => ({
                    ...node,
                    contents: [] // Standard skeleton response
                }))
            });
        }

        // 1. Structure Generation
        const data = await generateTopic({ query, mode });

        if (!data.nodes || !Array.isArray(data.nodes)) {
            throw new Error("Invalid structure from AI: missing nodes array");
        }

        // 2. Auth Session
        let userId = null;
        try {
            const session = await getServerSession(authOptions).catch(() => null);
            userId = (session?.user as any)?.id;
        } catch (e) { }

        const slug = `${query.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Math.random().toString(36).substring(2, 7)}`;

        // 3. Atomically create Topic and Skeleton Nodes
        const createdTopic = await prisma.topic.create({
            data: {
                query,
                slug,
                mode,
                userId: userId || null,
                status: "COMPLETED",
                nodes: {
                    create: data.nodes.map((nodeAi, idx) => {
                        const order = Number(nodeAi.order);
                        const depth = Number(nodeAi.depth);
                        return {
                            title: nodeAi.title?.slice(0, 100) || "Untitled Intelligence",
                            depth: isNaN(depth) ? 0 : depth,
                            orderIndex: isNaN(order) ? idx : order,
                        };
                    })
                }
            },
            include: {
                nodes: {
                    orderBy: { orderIndex: "asc" },
                    include: { contents: true }
                }
            }
        });

        console.log(`[Cosmic Sync] Universe created with ${createdTopic.nodes.length} nodes.`);

        return NextResponse.json({
            ...createdTopic,
            provider: data.provider,
            nodes: createdTopic.nodes.map((node: any) => ({
                ...node,
                contents: [] // Skeleton mode: frontend fetches content
            }))
        });

    } catch (error: any) {
        console.error("[Cosmic Trace Critical - Topic]:", error);
        return NextResponse.json({
            error: "Universe initialization failed.",
            details: error.message
        }, { status: 500 });
    }
}
