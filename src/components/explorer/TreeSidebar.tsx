"use client";

import { useState, useCallback } from "react";
import { ChevronRight, ChevronDown, Orbit, Target, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Node {
    id: string;
    title: string;
    depth: number;
    parentId: string | null;
    children?: Node[];
}

interface TreeSidebarProps {
    nodes: Node[];
    selectedNodeId: string | null;
    onSelectNode: (id: string, rect?: DOMRect) => void;
}

export function TreeSidebar({ nodes, selectedNodeId, onSelectNode }: TreeSidebarProps) {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(nodes.map(n => n.id)));

    const toggleExpand = useCallback((id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const renderNode = (node: Node, index: number) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedNodes.has(node.id);
        const isSelected = selectedNodeId === node.id;

        const handleSelect = (e: React.MouseEvent) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            onSelectNode(node.id, rect);
        };

        return (
            <div key={node.id} className="select-none mb-4 last:mb-0 relative group">
                <div
                    onClick={handleSelect}
                    className={cn(
                        "relative flex items-center gap-4 py-4 px-5 cursor-pointer transition-all duration-300 rounded-2xl overflow-hidden",
                        isSelected
                            ? "bg-primary/10 border border-primary/20 shadow-[0_0_25px_rgba(34,211,238,0.15)]"
                            : "bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.04] hover:border-white/10"
                    )}
                >
                    {/* Active Pulse Indicator */}
                    {isSelected && (
                        <motion.div
                            layoutId="active-nav-glow"
                            className="absolute left-0 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_15px_rgba(34,211,238,1)]"
                        />
                    )}

                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black font-mono text-white/20 uppercase tracking-widest">
                                TR_{String(index + 1).padStart(2, '0')}
                            </span>
                            {isSelected && (
                                <motion.div
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-1.5 h-1.5 rounded-full bg-primary"
                                />
                            )}
                        </div>
                        <span className={cn(
                            "text-sm font-bold uppercase tracking-wide truncate transition-colors",
                            isSelected ? "text-white" : "text-white/40 group-hover:text-white/70"
                        )}>
                            {node.title}
                        </span>
                    </div>

                    {hasChildren && (
                        <button
                            onClick={(e) => toggleExpand(node.id, e)}
                            className={cn(
                                "p-2 rounded-lg hover:bg-white/5 transition-all",
                                isSelected ? "text-primary" : "text-white/20"
                            )}
                        >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                    )}
                </div>

                {hasChildren && isExpanded && (
                    <div className="mt-4 space-y-4 ml-6 border-l border-white/5 pl-6">
                        {node.children!.map((child, idx) => renderNode(child, idx))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white/[0.01] backdrop-blur-3xl border-r border-white/5 relative overflow-hidden">
            {/* Sidebar Header */}
            <div className="p-8 pb-4 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center shadow-inner group-hover:border-primary/20 transition-all">
                        <Compass className="w-6 h-6 text-primary/80" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Mission Deck</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[9px] font-mono text-green-500/40 tracking-widest uppercase">System_Online</span>
                        </div>
                    </div>
                </div>
                <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            {/* Navigation Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-2">
                {nodes.map((node, index) => renderNode(node, index))}
            </div>

            {/* Sidebar Footer Scanline */}
            <div className="p-8 border-t border-white/5">
                <div className="flex items-center justify-between opacity-30">
                    <span className="text-[8px] font-mono font-black text-white uppercase tracking-tighter">Vector_Nav_v4.0</span>
                    <Orbit className="w-3 h-3 animate-spin-slow text-primary" />
                </div>
            </div>
        </div>
    );
}
