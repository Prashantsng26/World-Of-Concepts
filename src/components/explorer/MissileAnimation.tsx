"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface MissileAnimationProps {
    startPos: { x: number; y: number } | null;
    onComplete: () => void;
}

export function MissileAnimation({ startPos, onComplete }: MissileAnimationProps) {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (startPos) {
            setShouldRender(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
                onComplete();
            }, 2000); // Longer sequence
            return () => clearTimeout(timer);
        }
    }, [startPos, onComplete]);

    if (!startPos || !shouldRender) return null;

    return (
        <div className="fixed inset-0 z-[999] pointer-events-none">
            <motion.div
                initial={{
                    x: startPos.x,
                    y: startPos.y,
                    opacity: 0,
                    scale: 0.2,
                    rotate: 90
                }}
                animate={{
                    // 1. Move Right -> 2. Turn -> 3. Return Center
                    x: [startPos.x, window.innerWidth - 120, window.innerWidth - 120, window.innerWidth / 2],
                    y: [startPos.y, startPos.y - 100, startPos.y - 100, window.innerHeight / 2],
                    rotate: [90, 90, 270, 270],
                    opacity: [0, 1, 1, 1, 0],
                    scale: [0.2, 1, 1.2, 1.2, 0.5],
                }}
                transition={{
                    duration: 2.0,
                    times: [0, 0.4, 0.6, 1],
                    ease: "easeInOut"
                }}
                className="absolute"
                style={{ willChange: "transform, opacity" }}
            >
                <div className="relative -translate-x-1/2 -translate-y-1/2">
                    {/* Custom Rocket SVG */}
                    <svg width="60" height="100" viewBox="0 0 60 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]">
                        {/* Rocket Body */}
                        <path d="M30 0C30 0 10 20 10 50V80H50V50C50 20 30 0 30 0Z" fill="#F8FAFC" />
                        <path d="M30 0C30 0 15 15 15 45V75H45V45C45 15 30 0 30 0Z" fill="#E2E8F0" />

                        {/* Nose Cone */}
                        <path d="M30 0C30 0 20 10 20 25H40C40 10 30 0 30 0Z" fill="#38BDF8" />

                        {/* Windows */}
                        <circle cx="30" cy="40" r="4" fill="#0EA5E9" />
                        <circle cx="30" cy="55" r="4" fill="#0EA5E9" />

                        {/* Fins */}
                        <path d="M10 60L0 80V85H10V60Z" fill="#0EA5E9" />
                        <path d="M50 60L60 80V85H50V60Z" fill="#0EA5E9" />

                        {/* Engine Exhaust Flame */}
                        <motion.path
                            d="M20 80C20 80 15 95 30 110C45 95 40 80 40 80H20Z"
                            fill="url(#fireGradient)"
                            animate={{
                                d: [
                                    "M20 80C20 80 15 95 30 110C45 95 40 80 40 80H20Z",
                                    "M20 80C20 80 10 100 30 120C50 100 40 80 40 80H20Z",
                                    "M20 80C20 80 15 95 30 110C45 95 40 80 40 80H20Z"
                                ]
                            }}
                            transition={{ duration: 0.1, repeat: Infinity }}
                        />

                        <defs>
                            <linearGradient id="fireGradient" x1="30" y1="80" x2="30" y2="120" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#38BDF8" />
                                <stop offset="0.5" stopColor="#0EA5E9" />
                                <stop offset="1" stopColor="#1E3A8A" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Secondary Particle Trails */}
                    <div className="absolute top-[80%] left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <motion.div
                            className="w-1 h-20 bg-gradient-to-b from-sky-400 to-transparent blur-[4px]"
                            animate={{ height: [20, 60, 20], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 0.2, repeat: Infinity }}
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
