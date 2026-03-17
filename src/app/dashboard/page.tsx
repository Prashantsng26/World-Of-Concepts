"use client";

import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { StarsBackground } from "@/components/layout/StarsBackground";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Book, Clock, Map, ChevronRight, Search, Activity, Target, Zap, TrendingUp, History } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const { data: session } = useSession();
    const { data: topics, isLoading } = useQuery({
        queryKey: ["user-topics"],
        queryFn: async () => {
            const res = await fetch("/api/topics/user");
            return res.json();
        },
    });

    const proficiency = Math.min((topics?.length || 0) * 5, 100);
    const getRank = (count: number) => {
        if (count < 5) return "Novice Voyager";
        if (count < 15) return "Conceptual Explorer";
        if (count < 30) return "Intellectual Analyst";
        return "Master Intelligence Officer";
    };

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

            {/* Subtle Gradient Glows - Adjusted for Light Mode */}
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
                        <Activity className="w-3 h-3" />
                        <span>Command Center</span>
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-6xl font-serif font-black text-slate-900 tracking-tight flex items-center gap-4">
                            Your Universe<span className="text-primary">.</span>
                        </h1>
                        <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mt-2 leading-relaxed">
                            A visualized repository of your intellectual voyages across the concept galaxy.
                        </p>
                    </div>
                </motion.header>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid lg:grid-cols-12 gap-8"
                >
                    {/* STATS OVERVIEW */}
                    <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        {[
                            { label: "Concepts Explored", value: topics?.length || 0, icon: Target, color: "text-blue-500", bg: "bg-blue-50" },
                            { label: "Knowledge Level", value: "Explorer", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
                            { label: "Active Threads", value: "3", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
                            { label: "Last Session", value: "Today", icon: History, color: "text-primary", bg: "bg-sky-50" },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                variants={itemVariants}
                                className="bg-white border border-slate-200 p-6 rounded-[2rem] flex items-center justify-between group hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-default"
                            >
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                                    <p className="text-2xl font-serif font-black text-slate-800">{stat.value}</p>
                                </div>
                                <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* MAIN CONTENT: RECENTLY EXPLORED */}
                    <motion.div variants={itemVariants} className="lg:col-span-8">
                        <div className="h-full bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden flex flex-col shadow-sm">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-serif font-black text-slate-900">Neural History</h2>
                                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Recent Intelligence Log</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 rounded-full bg-white border border-slate-200 hover:border-primary/30 transition-colors">
                                        <Search className="w-4 h-4 text-slate-400" />
                                    </button>
                                </div>
                            </div>

                            <CardContent className="p-0 flex-1 overflow-auto max-h-[600px] scrollbar-hide">
                                {isLoading ? (
                                    <div className="p-8 space-y-6">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="flex gap-6 items-center animate-pulse">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-100" />
                                                <div className="space-y-2 flex-1">
                                                    <div className="h-4 w-1/3 bg-slate-100 rounded" />
                                                    <div className="h-3 w-1/4 bg-slate-100 rounded" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : topics?.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {topics.map((topic: any, i: number) => (
                                            <Link
                                                key={topic.id}
                                                href={`/explorer?q=${encodeURIComponent(topic.query)}&mode=${topic.mode}`}
                                                className="group"
                                            >
                                                <motion.div
                                                    whileHover={{ x: 10 }}
                                                    className="p-6 md:p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <div className="relative">
                                                            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                                                                <Book className="w-6 h-6 text-primary" />
                                                            </div>
                                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
                                                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h4 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight">{topic.query}</h4>
                                                            <div className="flex items-center gap-4 text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">
                                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(topic.createdAt).toLocaleDateString()}</span>
                                                                <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 px-2 py-0 text-[9px] group-hover:border-primary/30 group-hover:text-primary transition-colors">{topic.mode}</Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Resume Journey</span>
                                                        <ChevronRight className="w-5 h-5 text-primary" />
                                                    </div>
                                                </motion.div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-20 text-center space-y-8 flex flex-col items-center justify-center">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center animate-[pulse_4s_infinite]">
                                                <Map className="w-10 h-10 text-slate-200" />
                                            </div>
                                            <div className="absolute inset-0 border-2 border-primary/20 rounded-full border-dashed animate-[spin_20s_linear_infinite]" />
                                        </div>
                                        <div className="space-y-2 px-12">
                                            <p className="text-slate-400 text-lg font-medium tracking-wide italic">"The voyage of discovery is not in seeking new landscapes, but in having new eyes."</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">— Marcel Proust</p>
                                        </div>
                                        <Link href="/">
                                            <button className="px-10 py-4 rounded-full bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200">
                                                Initiate Exploration
                                            </button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </div>
                    </motion.div>

                    {/* SIDEBAR: EXTRA INTEL */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* PROFILE CARD */}
                        <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-blue-500 p-0.5 shadow-lg shadow-primary/10">
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white">
                                        <img src={session?.user?.image || `https://avatar.vercel.sh/${session?.user?.email || 'user'}`} alt="User" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                                        {mounted ? (session?.user?.name || "Intelligence Officer") : "Intelligence Officer"}
                                    </h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        {mounted ? getRank(topics?.length || 0) : "Novice Voyager"}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                                        <span className="text-slate-400">System Proficiency</span>
                                        <span className="text-primary">{mounted ? proficiency : 0}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: mounted ? `${proficiency}%` : "0%" }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="h-full bg-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* UPGRADE CARD */}
                        <motion.div variants={itemVariants} className="bg-white border border-primary/20 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group shadow-sm">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                <Zap className="w-20 h-20 text-primary" />
                            </div>
                            <div className="space-y-2 relative z-10">
                                <h3 className="text-xl font-serif font-black text-slate-900">Neural++</h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                    Unlock deeper extraction modes and unlimited concept threads.
                                </p>
                            </div>
                            <button className="w-full py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-colors relative z-10 shadow-lg shadow-slate-200">
                                Upgrade Access
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

