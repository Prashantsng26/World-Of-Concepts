"use client";

import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { StarsBackground } from "@/components/layout/StarsBackground";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bookmark, ExternalLink, Library, Clock, ArrowRight, Search, LayoutGrid, Info, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function BookmarksPage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const { data: bookmarks, isLoading, error } = useQuery({
        queryKey: ["bookmarks"],
        queryFn: async () => {
            const res = await fetch("/api/bookmarks");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to load library");
            return data;
        },
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen relative flex flex-col bg-[#F8FAFC] selection:bg-primary/20">
            <Navbar isLight={true} />
            <StarsBackground />

            {/* Subtle Gradient Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            </div>

            <main className="flex-1 pt-32 pb-24 px-6 md:px-12 max-w-[1400px] mx-auto w-full relative z-10">
                <motion.header
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12 space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                        <Library className="w-3 h-3" />
                        <span>Knowledge Vault</span>
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-6xl font-serif font-black text-slate-900 tracking-tight flex items-center gap-4">
                            Saved Concepts<span className="text-primary italic font-light">.</span>
                        </h1>
                        <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mt-2 leading-relaxed">
                            Your curated library of deep-extracted intelligence and conceptual nodes.
                        </p>
                    </div>
                </motion.header>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {isLoading ? (
                        [1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-[280px] w-full bg-white border border-slate-100 animate-pulse rounded-[2.5rem]" />
                        ))
                    ) : (mounted && bookmarks?.length > 0) ? (
                        bookmarks.map((bookmark: any) => (
                            <motion.div key={bookmark.id} variants={itemVariants}>
                                <Link
                                    href={`/explorer?q=${encodeURIComponent(bookmark.node?.topic?.query || "")}&mode=${bookmark.node?.topic?.mode || ""}`}
                                    className="group block h-full"
                                >
                                    <Card className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden h-full hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col group relative">
                                        <div className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 border border-slate-100 opacity-0 group-hover:opacity-100 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                                            <ExternalLink className="w-4 h-4 text-primary" />
                                        </div>

                                        <CardHeader className="p-8 pb-4">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Badge variant="outline" className="bg-sky-50 text-blue-600 border-blue-100 text-[9px] font-black tracking-widest uppercase px-2 py-0">
                                                    {bookmark.node?.topic?.mode}
                                                </Badge>
                                                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                                                    <Clock className="w-3 h-3" />
                                                    {mounted && new Date(bookmark.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <CardTitle className="text-2xl font-serif font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">
                                                {bookmark.node?.title}
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent className="p-8 pt-0 flex-1 flex flex-col justify-between space-y-6">
                                            <p className="text-slate-500 text-sm leading-relaxed font-medium italic line-clamp-3">
                                                "{bookmark.node?.contents?.[0]?.summary || "No summary available"}"
                                            </p>

                                            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                                        <Search className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600">
                                                        {bookmark.node?.topic?.query}
                                                    </span>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))
                    ) : error ? (
                        <motion.div
                            variants={itemVariants}
                            className="md:col-span-2 lg:col-span-3 bg-white border border-red-100 rounded-[3rem] p-24 text-center space-y-6"
                        >
                            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                                <AlertTriangle className="w-10 h-10 text-red-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-serif font-black text-slate-900">Synchronization Error</h3>
                                <p className="text-slate-500 font-medium">{(error as any).message}</p>
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-10 py-4 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all"
                            >
                                Re-sync Library
                            </button>
                        </motion.div>
                    ) : mounted ? (
                        <motion.div
                            variants={itemVariants}
                            className="md:col-span-2 lg:col-span-3 bg-white border border-slate-200 rounded-[3rem] p-24 text-center space-y-10 shadow-sm"
                        >
                            <div className="relative mx-auto w-32 h-32">
                                <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping" />
                                <div className="relative w-32 h-32 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                                    <Bookmark className="w-12 h-12 text-slate-200" />
                                </div>
                            </div>

                            <div className="max-w-md mx-auto space-y-4">
                                <h3 className="text-3xl font-serif font-black text-slate-900 leading-tight">Your knowledge library awaits its first discovery.</h3>
                                <p className="text-slate-400 font-medium text-lg leading-relaxed">
                                    Nodes you bookmark during your explorations will materialize here as a persistent intelligence network.
                                </p>
                            </div>

                            <Link href="/">
                                <button className="px-12 py-5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary hover:text-black hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-200">
                                    Begin Exploration
                                </button>
                            </Link>
                        </motion.div>
                    ) : null}
                </motion.div>
            </main>
        </div>
    );
}

