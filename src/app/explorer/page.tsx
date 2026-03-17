"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { TreeSidebar } from "@/components/explorer/TreeSidebar";
import { NodeContent } from "@/components/explorer/NodeContent";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StarsBackground } from "@/components/layout/StarsBackground";
import { RocketLoader } from "@/components/explorer/RocketLoader";
import { MissileAnimation } from "@/components/explorer/MissileAnimation";
import { toast } from "sonner";
import { Activity, RefreshCw, AlertTriangle, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ExplorerContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q");
    const mode = searchParams.get("mode") || "BRIEF";
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [pendingNodeId, setPendingNodeId] = useState<string | null>(null);
    const [missileStart, setMissileStart] = useState<{ x: number; y: number } | null>(null);
    const queryClient = useQueryClient();

    // Fetch topic data
    const { data: topic, isLoading, error, refetch } = useQuery({
        queryKey: ["topic", query, mode],
        queryFn: async () => {
            if (!query) return null;
            try {
                const res = await fetch("/api/topics/generate", {
                    method: "POST",
                    body: JSON.stringify({ query, mode }),
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.details || data.error || "The link to the concept universe was severed.");
                }
                return res.json();
            } catch (err: any) {
                console.error("Fetch Error:", err);
                throw err;
            }
        },
        enabled: !!query,
        staleTime: Infinity,
        retry: 1,
    });

    // Mutation for expanding nodes
    const expandMutation = useMutation({
        mutationFn: async (nodeId: string) => {
            const res = await fetch(`/api/nodes/${nodeId}/expand`, {
                method: "POST",
                body: JSON.stringify({ mode }),
            });
            if (!res.ok) throw new Error("Synchronization failure during expansion.");
            return res.json();
        },
        onSuccess: (newNodes) => {
            queryClient.setQueryData(["topic", query, mode], (old: any) => {
                if (!old) return old;
                const existingIds = new Set(old.nodes.map((n: any) => n.id));
                const filteredNewNodes = newNodes.filter((n: any) => !existingIds.has(n.id));
                return { ...old, nodes: [...old.nodes, ...filteredNewNodes] };
            });
            toast.success("New data nodes established.");
        },
    });

    // Content Retrieval Mutation
    const fetchContentMutation = useMutation({
        mutationFn: async (nodeId: string) => {
            const res = await fetch(`/api/nodes/${nodeId}/content`, {
                method: "POST",
                body: JSON.stringify({ mode }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.details || data.error || "Content packet fragmented in transit.");
            }
            return res.json();
        },
        onSuccess: (newContent, nodeId) => {
            queryClient.setQueryData(["topic", query, mode], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    nodes: old.nodes.map((n: any) =>
                        n.id === nodeId ? { ...n, contents: [newContent] } : n
                    ),
                };
            });
        },
    });

    const bookmarkMutation = useMutation({
        mutationFn: async (nodeId: string) => {
            const res = await fetch("/api/bookmarks", {
                method: "POST",
                body: JSON.stringify({ nodeId }),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
            toast.success("Node anchored to your neural map.");
        },
    });

    // Set initial selected node
    useEffect(() => {
        if (topic?.nodes?.[0] && !selectedNodeId) {
            setSelectedNodeId(topic.nodes[0].id);
        }
    }, [topic, selectedNodeId]);

    // Auto-fetch logic with improved resilience
    useEffect(() => {
        if (!selectedNodeId || !topic) return;
        const selectedNode = topic.nodes.find((n: any) => n.id === selectedNodeId);
        const hasContent = selectedNode?.contents && selectedNode.contents.length > 0;

        if (selectedNode && !hasContent && !fetchContentMutation.isPending && !fetchContentMutation.isError) {
            fetchContentMutation.mutate(selectedNodeId);
        }
    }, [selectedNodeId, topic, fetchContentMutation.isPending, fetchContentMutation.isError]);

    const handleNodeSelection = useCallback((id: string, rect?: DOMRect) => {
        if (rect) {
            setMissileStart({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
            setPendingNodeId(id);
        } else {
            setSelectedNodeId(id);
        }
    }, []);

    if (isLoading) return <RocketLoader />;

    if (error) {
        return (
            <div className="min-h-screen relative flex items-center justify-center p-6 bg-[#02030a]">
                <StarsBackground />
                <div className="text-center space-y-8 max-w-xl p-12 glass rounded-[3rem] border border-white/5 relative z-10 shadow-2xl">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-8 h-8 text-primary shadow-[0_0_20px_rgba(var(--primary),0.5)]" />
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-4xl font-serif font-black text-white tracking-tighter uppercase italic">Transmission Error</h2>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 overflow-hidden">
                            <div className="flex items-center gap-2 mb-2">
                                <Terminal className="w-3 h-3 text-primary/60" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Orbital Trace Log</span>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono leading-relaxed break-words">
                                ERROR_TYPE: SIGNAL_FRAGMENTED<br />
                                TRACE: {error?.message || "Internal Void Interference"}
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => refetch()}
                        size="lg"
                        className="w-full rounded-2xl h-16 font-black bg-white text-black hover:bg-primary hover:text-white transition-all transform hover:scale-[1.02] active:scale-95"
                    >
                        RETRY CONNECTION
                    </Button>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white/40 transition-colors"
                    >
                        Abort Mission
                    </button>
                </div>
            </div>
        );
    }

    const selectedNode = topic?.nodes?.find((n: any) => n.id === selectedNodeId);

    const buildTree = (nodes: any[]) => {
        const map: Record<string, any> = {};
        nodes.forEach(n => map[n.id] = { ...n, children: [] });
        const roots: any[] = [];
        nodes.forEach(n => {
            if (n.parentId && map[n.parentId]) map[n.parentId].children.push(map[n.id]);
            else roots.push(map[n.id]);
        });
        return roots;
    };

    const treeData = topic ? buildTree(topic.nodes) : [];

    return (
        <div className="h-screen bg-transparent text-foreground flex flex-col overflow-hidden">
            <Navbar />
            <StarsBackground />

            <MissileAnimation
                startPos={missileStart}
                onComplete={() => {
                    setMissileStart(null);
                    if (pendingNodeId) {
                        setSelectedNodeId(pendingNodeId);
                        setPendingNodeId(null);
                    }
                }}
            />

            <div className="flex-1 flex overflow-hidden pt-16">
                <aside className="w-80 border-r border-white/5 glass hidden md:block overflow-hidden flex flex-col">
                    <TreeSidebar
                        nodes={treeData}
                        selectedNodeId={selectedNodeId}
                        onSelectNode={handleNodeSelection}
                    />
                </aside>

                <main className="flex-1 overflow-y-auto custom-scrollbar relative">
                    <div className="max-w-4xl mx-auto p-10 md:p-16 lg:p-20">
                        {selectedNode && (selectedNode.contents?.length > 0) ? (
                            <NodeContent
                                node={selectedNode}
                                mode={mode}
                                onExpand={(id) => expandMutation.mutate(id)}
                                isExpanding={expandMutation.isPending}
                                onBookmark={(id) => bookmarkMutation.mutate(id)}
                                onRefresh={(id) => fetchContentMutation.mutate(id)}
                                isRefreshing={fetchContentMutation.isPending}
                            />
                        ) : selectedNode ? (
                            <div className="space-y-12 py-10 min-h-[60vh] flex flex-col items-center justify-center">
                                {fetchContentMutation.isError ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-12 glass rounded-[3rem] border border-white/5 space-y-10 max-w-md">
                                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <RefreshCw className="w-8 h-8 text-primary" />
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-2xl font-serif font-black text-white uppercase tracking-widest italic">Node Fragment Unreadable</h3>
                                            <div className="bg-white/5 p-4 rounded-xl text-left">
                                                <p className="text-[10px] text-muted-foreground font-mono break-words leading-relaxed">
                                                    CAUSE: {fetchContentMutation.error?.message || "Unknown Space Debris"}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => fetchContentMutation.mutate(selectedNodeId!)}
                                            className="w-full rounded-2xl h-14 font-black bg-white text-black hover:bg-primary transition-all shadow-xl"
                                        >
                                            RE-SYNC FRAGMENT
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col items-center space-y-12">
                                        <div className="relative">
                                            <div className="w-32 h-32 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                            <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                                        </div>
                                        <div className="text-center space-y-4">
                                            <h3 className="text-3xl font-serif font-black text-white uppercase tracking-[0.3em] italic">Synthesizing Intel</h3>
                                            <p className="text-primary/60 font-mono text-[10px] font-black tracking-widest animate-pulse">EXTRACTING NEURAL DATA PARTICLES...</p>
                                        </div>
                                        <div className="w-full max-w-md space-y-4 pt-4 px-10">
                                            <Skeleton className="h-2 w-full bg-white/5 rounded-full" />
                                            <Skeleton className="h-2 w-5/6 bg-white/5 rounded-full" />
                                            <Skeleton className="h-2 w-4/6 bg-white/5 rounded-full" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full min-h-[50vh]">
                                <p className="text-primary/40 font-black uppercase tracking-[0.5em] text-[10px] italic">Select a node to begin synchronization</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function ExplorerPage() {
    return (
        <Suspense fallback={<RocketLoader />}>
            <ExplorerContent />
        </Suspense>
    );
}
