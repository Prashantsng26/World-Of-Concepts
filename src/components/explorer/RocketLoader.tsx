"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

export function RocketLoader({ mini = false }: { mini?: boolean }) {
    const [mounted, setMounted] = useState(false);
    const [launchProgress, setLaunchProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        setMounted(true);
        if (mini) return;

        // Audio for transition
        const audio = new Audio("https://cdn.pixabay.com/audio/2022/03/26/audio_95c64589f1.mp3");
        audio.volume = 0.4;
        audio.loop = true; // Loop while loading
        audio.play().catch(() => { });
        audioRef.current = audio;

        const duration = 2500;
        const start = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            setLaunchProgress(progress);
            if (progress === 1) clearInterval(interval);
        }, 16);

        return () => {
            clearInterval(interval);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
                audioRef.current = null;
            }
        };
    }, [mini]);

    const gasClouds = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        size: Math.random() * 300 + 200,
        duration: Math.random() * 2 + 1,
    })), []);

    if (!mounted) return null;

    if (mini) {
        return (
            <div className="relative py-8 flex flex-col items-center">
                <style jsx>{`
                    @keyframes mini-thrust {
                        0%, 100% { transform: scaleY(1); opacity: 0.8; }
                        50% { transform: scaleY(1.5); opacity: 1; }
                    }
                `}</style>
                <div className="relative">
                    <svg width="40" height="60" viewBox="0 0 60 100" fill="none" className="text-primary">
                        <path d="M30 0C30 0 10 20 10 50V80H50V50C50 20 30 0 30 0Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5" />
                        <path d="M10 60L0 80V85H10V60Z" fill="currentColor" />
                        <path d="M50 60L60 80V85H50V60Z" fill="currentColor" />
                    </svg>
                    <div
                        className="absolute top-[90%] left-1/2 -translate-x-1/2 w-3 origin-top h-8 bg-gradient-to-b from-sky-400 via-indigo-500 to-transparent blur-sm rounded-full"
                        style={{ animation: 'mini-thrust 0.1s infinite' }}
                    />
                </div>
                <p className="mt-4 text-[9px] text-primary/60 font-black tracking-widest animate-pulse">EXTRACTING DATA...</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#02030a]">
            <style jsx>{`
                @keyframes streak {
                    from { transform: translateY(-100vh); opacity: 0; }
                    50% { opacity: 1; }
                    to { transform: translateY(100vh); opacity: 0; }
                }
                @keyframes cloudMove {
                    from { transform: translateY(100vh) scale(0.5); opacity: 0; }
                    20% { opacity: 0.6; }
                    80% { opacity: 0.4; }
                    to { transform: translateY(-100vh) scale(2); opacity: 0; }
                }
                @keyframes sonicBoom {
                    from { transform: scale(0); opacity: 1; border-width: 10px; }
                    to { transform: scale(4); opacity: 0; border-width: 1px; }
                }
                .star-streak {
                    animation: streak var(--duration) linear infinite;
                    animation-delay: var(--delay);
                }
                .gas-cloud {
                    animation: cloudMove var(--duration) linear infinite;
                    animation-delay: var(--delay);
                }
                .sonic-ring {
                    animation: sonicBoom 0.8s ease-out forwards;
                }
            `}</style>

            {/* ATMOSPHERE LAYERS */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 transition-opacity duration-1000"
                    style={{
                        opacity: 1 - launchProgress,
                        background: 'linear-gradient(to bottom, #f8fafc 0%, #cbd5e1 100%)'
                    }}
                />
                <div
                    className="absolute inset-0 transition-opacity duration-1000 bg-gradient-to-b from-[#02030a] via-[#080c17] to-[#02030a]"
                    style={{ opacity: launchProgress }}
                />
            </div>

            {/* GAS CLOUDS (Atmosphere) */}
            <div className="absolute inset-0 z-5">
                {launchProgress > 0.1 && launchProgress < 0.6 && gasClouds.map((cloud) => (
                    <div
                        key={cloud.id}
                        className="gas-cloud absolute bg-white/10 blur-[60px] rounded-full"
                        style={{
                            left: `${cloud.left}%`,
                            width: `${cloud.size}px`,
                            height: `${cloud.size}px`,
                            // @ts-ignore
                            "--duration": `${cloud.duration}s`,
                            "--delay": `${cloud.delay}s`
                        }}
                    />
                ))}
            </div>

            {/* SPACE STREAKS */}
            <div className="absolute inset-0 z-10">
                {launchProgress > 0.6 && Array.from({ length: 60 }).map((_, i) => (
                    <div
                        key={i}
                        className="star-streak absolute w-[1px] h-32 bg-sky-400/30 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `-10vh`,
                            // @ts-ignore
                            "--duration": `${0.2 + Math.random() * 0.3}s`,
                            "--delay": `${Math.random()}s`
                        }}
                    />
                ))}
            </div>

            {/* SONIC BOOM RING */}
            {launchProgress > 0.65 && launchProgress < 0.8 && (
                <div className="sonic-ring absolute border-2 border-white/20 rounded-full w-20 h-20 z-20" />
            )}

            {/* THE ROCKET */}
            <motion.div
                className="relative z-50 flex flex-col items-center"
                initial={{ y: "20vh" }}
                animate={launchProgress < 0.2 ? { y: ["20vh", "19.8vh", "20vh"] } : { y: "-150vh", scale: 0.5, rotate: 0 }}
                transition={launchProgress < 0.2 ? { duration: 0.05, repeat: Infinity } : { duration: 1.8, ease: "easeIn" }}
            >
                <div className="relative">
                    <svg width="80" height="130" viewBox="0 0 60 100" fill="none" className="drop-shadow-[0_0_40px_rgba(56,189,248,0.4)]">
                        <path d="M30 0C30 0 10 20 10 50V80H50V50C50 20 30 0 30 0Z" fill={launchProgress < 0.3 ? "#F8FAFC" : "#ffffff"} />
                        <path d="M30 0C30 0 15 15 15 45V75H45V45C45 15 30 0 30 0Z" fill={launchProgress < 0.3 ? "#E2E8F0" : "#cbd5e1"} />
                        <path d="M30 0C30 0 20 10 20 25H40C40 10 30 0 30 0Z" fill="#38BDF8" />
                        <circle cx="30" cy="40" r="4" fill="#0EA5E9" />
                        <path d="M10 60L0 80V85H10V60Z" fill="#0EA5E9" />
                        <path d="M50 60L60 80V85H50V60Z" fill="#0EA5E9" />
                        <motion.path
                            d="M20 80C20 80 15 95 30 110C45 95 40 80 40 80H20Z"
                            fill="url(#fireGradientLoader)"
                            animate={{ d: ["M20 80C20 80 15 95 30 110C45 95 40 80 40 80H20Z", "M20 80C20 80 5 105 30 130C55 105 40 80 40 80H20Z"] }}
                            transition={{ duration: 0.05, repeat: Infinity }}
                        />
                        <defs>
                            <linearGradient id="fireGradientLoader" x1="30" y1="80" x2="30" y2="130" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#38BDF8" />
                                <stop offset="0.4" stopColor="#0EA5E9" />
                                <stop offset="1" stopColor="#1E3A8A" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </motion.div>

            {/* STATUS HUD */}
            <div className="absolute bottom-20 z-[100] flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="px-8 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center gap-4"
                    >
                        <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/90">
                            {launchProgress < 0.2 ? "PRE-CRITICAL CHECK" : launchProgress < 0.7 ? "ATMOSPHERIC BREACH" : "ORBITAL INSERTION"}
                        </p>
                    </motion.div>
                    <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest">{Math.floor(launchProgress * 100)}% UNIVERSAL SYNC</p>
                </div>
                <div className="w-64 h-[2px] bg-white/5 rounded-full relative">
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-primary shadow-[0_0_15px_rgba(56,189,248,0.8)]"
                        animate={{ width: `${launchProgress * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
