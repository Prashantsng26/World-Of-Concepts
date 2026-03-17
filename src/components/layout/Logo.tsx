"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Logo({ className, isLight = false }: { className?: string, isLight?: boolean }) {
    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transform transition-transform duration-500 group-hover:scale-110"
            >
                {/* Orbital Paths */}
                <motion.circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke={isLight ? "rgba(2, 132, 199, 0.1)" : "rgba(34, 211, 238, 0.1)"}
                    strokeWidth="1"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                <motion.ellipse
                    cx="20"
                    cy="20"
                    rx="18"
                    ry="8"
                    stroke={isLight ? "rgba(2, 132, 199, 0.15)" : "rgba(34, 211, 238, 0.15)"}
                    strokeWidth="1"
                    initial={{ rotate: 45 }}
                    animate={{ rotate: 405 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
                <motion.ellipse
                    cx="20"
                    cy="20"
                    rx="18"
                    ry="8"
                    stroke={isLight ? "rgba(2, 132, 199, 0.15)" : "rgba(34, 211, 238, 0.15)"}
                    strokeWidth="1"
                    initial={{ rotate: -45 }}
                    animate={{ rotate: 315 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                />

                {/* Connection Lines */}
                <motion.path
                    d="M20 12V20L26 24"
                    stroke={isLight ? "rgba(2, 132, 199, 0.3)" : "rgba(34, 211, 238, 0.3)"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />

                {/* Central Core */}
                <circle
                    cx="20"
                    cy="20"
                    r="4"
                    fill={isLight ? "#0284c7" : "#22d3ee"}
                    className="shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                />

                {/* Glow Effect */}
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <circle
                    cx="20"
                    cy="20"
                    r="4"
                    fill={isLight ? "#0284c7" : "#22d3ee"}
                    opacity="0.3"
                    filter="url(#glow)"
                />

                {/* Floating Nodes */}
                <motion.circle
                    cx="32"
                    cy="12"
                    r="2"
                    fill={isLight ? "#0284c7" : "#22d3ee"}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                <motion.circle
                    cx="8"
                    cy="28"
                    r="1.5"
                    fill={isLight ? "#0284c7" : "#22d3ee"}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
                />
                <motion.circle
                    cx="28"
                    cy="32"
                    r="1"
                    fill={isLight ? "#0284c7" : "#22d3ee"}
                    animate={{ scale: [1, 2, 1], opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                />
            </svg>
        </div>
    );
}
