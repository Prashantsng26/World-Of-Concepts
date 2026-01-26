"use client";

import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function StarsBackground({ isLight = false }: { isLight?: boolean }) {
    const [mounted, setMounted] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setMounted(true);
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const x = (clientX / window.innerWidth - 0.5) * 30;
            const y = (clientY / window.innerHeight - 0.5) * 30;
            setMousePos({ x, y });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const starField = useMemo(() => {
        return Array.from({ length: 150 }).map((_, i) => ({
            id: i,
            top: Math.random() * 100,
            left: Math.random() * 100,
            size: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.5 + 0.2,
            duration: Math.random() * 4 + 3,
            delay: Math.random() * -10,
        }));
    }, []);

    const distantPlanets = useMemo(() => {
        return [
            { id: 1, size: 40, top: 15, left: 80, color: "#1e3a8a", orbit: 40, speed: 180, glow: "#3b82f630" },
            { id: 2, size: 25, top: 75, left: 15, color: "#312e81", orbit: 30, speed: 220, glow: "#6366f120" },
        ];
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#020617]">
            {/* Nebula */}
            <motion.div
                className="absolute inset-[-10%] opacity-20 bg-cover bg-center bg-no-repeat grayscale-[0.2]"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=2560")',
                    x: mousePos.x * 0.1,
                    y: mousePos.y * 0.1,
                }}
            />

            {/* Atmosphere */}
            <div className="absolute inset-0 opacity-40">
                <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] bg-[radial-gradient(circle_at_center,_#1e1b4b_0%,_transparent_70%)] blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[100%] h-[100%] bg-[radial-gradient(circle_at_center,_#0f172a_0%,_transparent_70%)] blur-[120px]" />
            </div>

            {/* Planets */}
            {distantPlanets.map((planet) => (
                <motion.div
                    key={planet.id}
                    className="absolute"
                    style={{
                        top: `${planet.top}%`,
                        left: `${planet.left}%`,
                        x: mousePos.x * 0.3,
                        y: mousePos.y * 0.3,
                    }}
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: planet.speed, repeat: Infinity, ease: "linear" }}
                        style={{ width: planet.size * 2, height: planet.size * 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <motion.div
                            style={{ x: planet.orbit }}
                            className="rounded-full shadow-2xl relative"
                        >
                            <div
                                className="rounded-full"
                                style={{
                                    width: planet.size,
                                    height: planet.size,
                                    background: `linear-gradient(135deg, ${planet.color}, #000)`,
                                    boxShadow: `inset -5px -5px 15px rgba(0,0,0,0.8), 0 0 20px ${planet.glow}`
                                }}
                            />
                        </motion.div>
                    </motion.div>
                </motion.div>
            ))}

            {/* Star Field */}
            <div className="absolute inset-0 overflow-hidden">
                {starField.map((star) => (
                    <motion.div
                        key={star.id}
                        className="absolute bg-white rounded-full"
                        style={{
                            top: `${star.top}%`,
                            left: `${star.left}%`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                        }}
                        animate={{
                            opacity: [star.opacity, star.opacity * 0.1, star.opacity],
                        }}
                        transition={{
                            duration: star.duration,
                            repeat: Infinity,
                            delay: Math.abs(star.delay),
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_#020617_100%)] opacity-80" />

            {/* Noise */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
                <svg width="100%" height="100%">
                    <filter id="subtleNoise">
                        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#subtleNoise)" />
                </svg>
            </div>
        </div>
    );
}
