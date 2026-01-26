"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { StarsBackground } from "@/components/layout/StarsBackground";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, BookOpen, GraduationCap, Zap } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { RocketLoader } from "@/components/explorer/RocketLoader";

const EXAMPLE_PROMPTS = [
  "Quantum Computing",
  "Roman Empire",
  "Black Holes",
  "Stoicism",
  "Architecture",
  "Metabolism",
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("BRIEF");
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const audioRef = useRef<HTMLAudioElement[]>([]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 40, stiffness: 80 };
  const sx = useSpring(mouseX, springConfig);
  const sy = useSpring(mouseY, springConfig);

  const visualX = useTransform(sx, [-500, 500], [20, -20]);
  const visualY = useTransform(sy, [-500, 500], [10, -10]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      // Clean up any lingering sounds when navigating away
      audioRef.current.forEach(a => {
        a.pause();
        a.src = "";
      });
    };
  }, [mouseX, mouseY]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setIsNavigating(true);

    // Play Rocket Roar (Heavy Lift-off)
    const roar = new Audio("https://cdn.pixabay.com/audio/2024/10/22/audio_4ea8695cbf.mp3");
    roar.volume = 0.5;
    roar.play().catch(console.error);
    audioRef.current.push(roar);

    // Delay navigation to let the user hear the initial boom and see the rocket
    setTimeout(() => {
      router.push(`/explorer?q=${encodeURIComponent(query)}&mode=${mode}`);
    }, 2000);
  };

  return (
    <main className="h-screen bg-white overflow-hidden flex flex-col md:flex-row relative selection:bg-primary/20">
      {isNavigating && <RocketLoader />}
      <Navbar isLight={true} />

      {/* Left Side: Content Box (White) */}
      <section className="w-full md:w-[42%] h-full relative z-10 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-lg space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Sparkles className="w-3 h-3 text-primary animate-pulse" />
              <span>AI Neural Engine</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-serif font-black text-slate-900 tracking-tighter leading-[0.9] pb-1">
              World of <br />
              <span className="text-primary italic font-light">Concepts</span>
            </h1>

            <p className="text-base text-slate-500 font-medium leading-relaxed max-w-xs">
              Explore the infinite atlas of human intelligence.
            </p>
          </motion.div>

          {/* Search Area */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-6"
          >
            <form onSubmit={handleSearch} className="group relative">
              <div className="relative flex items-center bg-slate-50/80 backdrop-blur-xl rounded-xl border border-slate-200/50 p-1.5 group-focus-within:border-primary/40 transition-all shadow-sm">
                <div className="ml-3">
                  <Search className="w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter curiosity..."
                  className="border-0 focus-visible:ring-0 text-lg bg-transparent py-6 text-slate-800 placeholder:text-slate-300 font-semibold px-3 tracking-tight h-10"
                />
                <Button
                  type="submit"
                  className="rounded-lg px-6 h-10 text-xs font-black shadow-lg bg-primary hover:bg-primary/90 transition-transform active:scale-95"
                >
                  EXPLORE
                </Button>
              </div>
            </form>

            <div className="flex flex-col gap-3">
              <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Depth</h3>
              <Tabs value={mode} onValueChange={setMode} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-100/50 border border-slate-200/50 rounded-xl h-11 p-1">
                  <TabsTrigger value="SHORT" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary flex gap-2 font-black text-[10px] uppercase tracking-wider text-slate-400">
                    <Zap className="w-3.5 h-3.5" /> Short
                  </TabsTrigger>
                  <TabsTrigger value="BRIEF" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary flex gap-2 font-black text-[10px] uppercase tracking-wider text-slate-400">
                    <BookOpen className="w-3.5 h-3.5" /> Brief
                  </TabsTrigger>
                  <TabsTrigger value="DETAILED" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary flex gap-2 font-black text-[10px] uppercase tracking-wider text-slate-400">
                    <GraduationCap className="w-3.5 h-3.5" /> Detail
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              {EXAMPLE_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => setQuery(p)}
                  className="text-[10px] font-black text-slate-300 hover:text-primary transition-colors uppercase tracking-widest"
                >
                  #{p}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Right Side Visual */}
      <section className="hidden md:flex flex-1 h-full relative overflow-hidden bg-slate-50 items-center justify-center">
        <motion.div
          style={{ x: visualX, y: visualY }}
          className="relative w-[110%] h-[110%] flex items-center justify-center"
        >
          <motion.img
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            src="/assets/landing-visual.png"
            alt="Cosmic Portal"
            className="w-full h-full object-contain pointer-events-none drop-shadow-[0_40px_80px_rgba(0,0,0,0.06)] scale-110"
          />
        </motion.div>

        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[15%] glass px-3 py-2 rounded-2xl border border-white/40 shadow-xl pointer-events-none"
        >
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Link</p>
        </motion.div>

        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-20" />
      </section>

      <footer className="absolute bottom-6 left-6 md:left-12 lg:left-16 z-20 hidden md:block">
        <p className="text-[9px] font-black text-slate-200 uppercase tracking-[0.4em]">© 2026 WOC — Boundless Discovery</p>
      </footer>
    </main>
  );
}
