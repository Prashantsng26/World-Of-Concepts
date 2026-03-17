"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Bookmark, Share2, Clock, Workflow,
    ArrowRight, Zap, Target, Orbit,
    Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NodeContentProps {
    node: any;
    mode: string;
    onExpand: (id: string) => void;
    isExpanding: boolean;
    onBookmark: (id: string) => void;
}

const MicroThrust = () => (
    <div className="absolute top-full left-1/2 -translate-x-1/2 flex gap-1 mt-[-2px]">
        {[1, 2, 3].map((i) => (
            <motion.div
                key={i}
                animate={{
                    height: i === 2 ? [10, 18, 10] : [6, 12, 6],
                    opacity: [0.4, 0.8, 0.4]
                }}
                transition={{ duration: 0.1 + (i * 0.05), repeat: Infinity }}
                className={cn(
                    "w-1.5 bg-gradient-to-b from-sky-400 to-transparent blur-[2px] rounded-full",
                    i === 2 ? "w-2.5 opacity-100" : "opacity-60"
                )}
            />
        ))}
    </div>
);

export function NodeContent({
    node,
    mode,
    onExpand,
    isExpanding,
    onBookmark,
}: NodeContentProps) {
    const content = node.contents?.[0] || {};
    const readingTime = mode === "SHORT" ? "1 min" : mode === "BRIEF" ? "3 min" : "10 min";

    const [quizIndex, setQuizIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [activeFlowStep, setActiveFlowStep] = useState(0);

    const quiz = content.quizData || [];
    const flowchart = content.flowchart || [];

    const handleQuizAnswer = (optionIndex: number) => {
        if (isAnswered) return;
        setSelectedOption(optionIndex);
        setIsAnswered(true);
    };

    const resetQuiz = () => {
        setSelectedOption(null);
        setIsAnswered(false);
        setQuizIndex((prev) => (prev + 1) % quiz.length);
    };

    const summaryPoints = content.summary
        ? content.summary.split('.').filter((s: string) => s.trim().length > 10).map((s: string) => s.trim() + ".")
        : [];

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-12 pb-24"
            >
                {/* Top Nav */}
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white/[0.03] backdrop-blur-md rounded-full px-3 py-1 border border-white/5">
                            <span className="text-[8px] font-mono text-primary/40 uppercase tracking-tighter">ID_{node.id.slice(-4)}</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">/ Mission_Log</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-transparent text-primary/60 border-primary/10 rounded-full font-mono text-[9px] uppercase tracking-tighter py-0.5">
                            {readingTime} SIG
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={() => onBookmark(node.id)} className="w-8 h-8 rounded-full hover:bg-white/5">
                            <Bookmark className="w-3 h-3 text-white/40" />
                        </Button>
                    </div>
                </div>

                {/* Header */}
                <header className="flex flex-col items-start gap-4">
                    <div className="relative group">
                        <motion.div
                            className={cn(
                                "relative px-8 py-5 bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-xl",
                                "rounded-t-[30px] rounded-b-[10px]"
                            )}
                        >
                            <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-4 h-4 bg-primary/20 border-t border-x border-primary/30 rounded-t-full" />

                            <div className="flex items-center gap-3 mb-2 opacity-50">
                                <Orbit className="w-3 h-3 text-primary" />
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">Subject Delta</span>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-serif font-black tracking-tight text-white leading-none">
                                {node.title}<span className="text-primary">.</span>
                            </h1>

                            <MicroThrust />
                        </motion.div>
                    </div>

                    <p className="text-lg md:text-xl font-light text-white/30 max-w-2xl border-l border-white/5 pl-6 ml-1">
                        {content.summary?.split('.')[0]}.
                    </p>
                </header>

                    <div className="space-y-16">
                        {/* INTEL FEED */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-3">
                                <Target className="w-4 h-4 text-primary/40" />
                                <span className="font-black text-[9px] uppercase tracking-[0.4em] text-white/10">Extraction Points</span>
                            </div>

                            <div className="space-y-6">
                                {summaryPoints.map((point: string, i: number) => (
                                    <motion.div
                                        key={i}
                                        className="flex gap-6 group"
                                    >
                                        <span className="text-[10px] font-mono text-primary/30 py-1">0{i + 1}</span>
                                        <p className="text-lg md:text-xl font-light leading-relaxed text-white/40 group-hover:text-white transition-colors">
                                            {point}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        {/* COMPACT INTERACTIVE FLOWCHART */}
                        {flowchart.length > 0 && (
                            <section className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Workflow className="w-3.5 h-3.5 text-green-400/40" />
                                        <span className="font-black text-[9px] uppercase tracking-[0.4em] text-white/10">Sequential Delta</span>
                                    </div>
                                </div>

                                <div className="relative space-y-4">
                                    {/* Small Connector Line */}
                                    <div className="absolute left-[21px] top-6 bottom-6 w-px bg-gradient-to-b from-primary/30 via-white/5 to-transparent z-0" />

                                    {flowchart.map((step: any, i: number) => (
                                        <motion.div
                                            key={i}
                                            onClick={() => setActiveFlowStep(i)}
                                            className={cn(
                                                "relative flex gap-6 items-start cursor-pointer group p-4 rounded-[1.5rem] transition-all",
                                                activeFlowStep === i
                                                    ? "bg-white/[0.02] border border-white/5 shadow-md"
                                                    : "bg-transparent border border-transparent hover:bg-white/[0.01]"
                                            )}
                                        >
                                            <div className="relative z-10">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300",
                                                    activeFlowStep === i
                                                        ? "bg-primary/20 border-primary shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                                                        : "bg-black border-white/5 group-hover:border-white/20"
                                                )}>
                                                    <span className={cn(
                                                        "text-[9px] font-black font-mono",
                                                        activeFlowStep === i ? "text-primary" : "text-white/20"
                                                    )}>
                                                        {String(i + 1).padStart(2, '0')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1 pt-0.5">
                                                <h4 className={cn(
                                                    "text-lg font-bold tracking-tight transition-colors",
                                                    activeFlowStep === i ? "text-white" : "text-white/40 group-hover:text-white/60"
                                                )}>
                                                    {step.step}
                                                </h4>
                                                <AnimatePresence>
                                                    {activeFlowStep === i && (
                                                        <motion.p
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="text-sm text-white/30 leading-relaxed font-light overflow-hidden"
                                                        >
                                                            {step.description}
                                                        </motion.p>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>


                {/* Quiz */}
                {quiz.length > 0 && (
                    <section className="pt-16 border-t border-white/5">
                        <div className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8 md:p-12 text-center space-y-8 relative overflow-hidden max-w-3xl mx-auto shadow-xl">
                            <div className="flex flex-col items-center gap-3 relative z-10">
                                <Zap className="w-5 h-5 text-primary shadow-[0_0_10px_rgba(34,211,238,0.4)]" />
                                <h3 className="font-black text-[10px] uppercase tracking-[0.6em] text-white/20">Validation_Pulse</h3>
                            </div>

                            <h4 className="text-2xl md:text-3xl font-serif font-black text-white leading-tight max-w-2xl mx-auto relative z-10">
                                {quiz[quizIndex].question}
                            </h4>

                            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto relative z-10">
                                {quiz[quizIndex].options.map((opt: string, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => handleQuizAnswer(i)}
                                        className={cn(
                                            "p-4 rounded-2xl border transition-all text-sm font-bold",
                                            !isAnswered ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20" :
                                                i === quiz[quizIndex].answer_index ? "bg-green-500/10 border-green-500/30 text-green-400" :
                                                    selectedOption === i ? "bg-red-500/10 border-red-500/30 text-red-400" : "opacity-20"
                                        )}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>

                            {isAnswered && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-4 relative z-10">
                                    <p className="text-white/30 text-sm max-w-lg mx-auto leading-relaxed italic font-light">"{quiz[quizIndex].explanation}"</p>
                                    <Button
                                        variant="outline"
                                        onClick={resetQuiz}
                                        className="rounded-full px-10 h-12 text-[10px] font-black uppercase tracking-[0.2em] border-white/10 text-white hover:bg-white hover:text-black transition-all"
                                    >
                                        Next Signal
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    </section>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
