
"use client";

import { useEffect, useState } from "react";
import { Loader2, Scan, FileCode, Sparkles, BrainCircuit, ShieldCheck, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
    title: string;
    subtitle?: string;
    steps?: string[];
}

export function LoadingScreen({ title, subtitle, steps }: LoadingScreenProps) {
    const [activeStep, setActiveStep] = useState(0);

    // Cycle through steps if provided
    useEffect(() => {
        if (!steps || steps.length === 0) return;

        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % steps.length);
        }, 2000);

        return () => clearInterval(interval);
    }, [steps]);

    return (
        <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center text-white relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none animate-pulse" />

            <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6">
                {/* Central Animation */}
                <div className="relative mb-12">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-ping" style={{ animationDuration: "3s" }} />
                    <div className="relative w-24 h-24 bg-[#0a0a0a] border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Animated Scanner Bar */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_15px_2px_rgba(59,130,246,0.5)] animate-[scan_2s_ease-in-out_infinite]" />

                        <BrainCircuit className="w-10 h-10 text-blue-400 animate-pulse" />
                    </div>

                    {/* Orbiting Icons */}
                    <div className="absolute top-0 left-0 w-full h-full animate-[spin_10s_linear_infinite]">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 p-2 bg-[#0a0a0a] border border-white/10 rounded-full">
                            <FileCode className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 p-2 bg-[#0a0a0a] border border-white/10 rounded-full">
                            <ShieldCheck className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-white mb-3 text-center">{title}</h2>
                <p className="text-gray-400 text-center mb-8">{subtitle}</p>

                {/* Steps Indicator */}
                {steps && steps.length > 0 && (
                    <div className="w-full space-y-3">
                        {steps.map((step, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg border transition-all duration-300",
                                    idx === activeStep
                                        ? "bg-white/5 border-blue-500/30 shadow-lg shadow-blue-500/10 scale-105"
                                        : "bg-transparent border-transparent opacity-50"
                                )}
                            >
                                <div className={cn(
                                    "w-2 h-2 rounded-full shrink-0",
                                    idx === activeStep ? "bg-blue-400 animate-pulse" : "bg-gray-600"
                                )} />
                                <span className={cn(
                                    "text-sm font-medium",
                                    idx === activeStep ? "text-blue-100" : "text-gray-500"
                                )}>
                                    {step}
                                </span>
                                {idx === activeStep && <Loader2 className="w-3 h-3 text-blue-400 animate-spin ml-auto" />}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
