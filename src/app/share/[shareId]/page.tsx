"use client";

import React, { Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { TreeSidebar } from "@/components/explorer/TreeSidebar";
import { NodeContent } from "@/components/explorer/NodeContent";
import { StarsBackground } from "@/components/layout/StarsBackground";
import { Badge } from "@/components/ui/badge";

function ShareContent({ params }: { params: Promise<{ shareId: string }> }) {
    const { shareId } = React.use(params);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    const { data: shareData, isLoading } = useQuery({
        queryKey: ["share", shareId],
        queryFn: async () => {
            const res = await fetch(`/api/share/${shareId}`);
            return res.json();
        },
    });

    const topic = shareData?.topic;

    if (isLoading) {
        return (
            <div className="min-h-screen relative flex items-center justify-center">
                <StarsBackground />
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!topic) {
        return (
            <div className="min-h-screen relative flex items-center justify-center">
                <StarsBackground />
                <div className="text-center">
                    <h2 className="text-2xl text-white font-serif">Topic Not Found</h2>
                </div>
            </div>
        );
    }

    const nodes = topic.nodes || [];
    if (!selectedNodeId && nodes.length > 0) setSelectedNodeId(nodes[0].id);

    const buildTree = (nodes: any[]) => {
        const map: Record<string, any> = {};
        nodes.forEach(n => map[n.id] = { ...n, children: [] });
        const roots: any[] = [];
        nodes.forEach(n => {
            if (n.parentId && map[n.parentId]) {
                map[n.parentId].children.push(map[n.id]);
            } else {
                roots.push(map[n.id]);
            }
        });
        return roots;
    };

    const treeData = buildTree(nodes);
    const selectedNode = nodes.find((n: any) => n.id === selectedNodeId);

    return (
        <div className="min-h-screen flex flex-col bg-[#020617]">
            <Navbar />
            <StarsBackground />
            <div className="flex-1 flex pt-16 overflow-hidden">
                <aside className="w-80 border-r border-white/5 glass hidden md:block">
                    <div className="p-4 border-b border-white/5 bg-primary/5">
                        <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/20">Public View</Badge>
                    </div>
                    <TreeSidebar
                        nodes={treeData}
                        selectedNodeId={selectedNodeId}
                        onSelectNode={setSelectedNodeId}
                    />
                </aside>
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto">
                        {selectedNode && (
                            <NodeContent
                                node={selectedNode}
                                mode={topic.mode}
                                onExpand={() => { }} // Read-only
                                isExpanding={false}
                                onBookmark={() => { }} // Read-only or prompt signup
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function SharePage({ params }: { params: Promise<{ shareId: string }> }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen relative flex items-center justify-center">
                <StarsBackground />
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <ShareContent params={params} />
        </Suspense>
    );
}
