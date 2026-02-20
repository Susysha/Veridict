"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Cpu, Database, Network, Eye, Lock, Activity, Server, Zap } from "lucide-react";

export default function StatisticsPage() {
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-ink text-text font-sans selection:bg-gold/20 relative overflow-x-hidden">
            {/* ─── Background Effects ─── */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,_rgba(201,168,76,0.1)_0%,_transparent_60%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,_rgba(100,80,200,0.05)_0%,_transparent_60%)]"></div>
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                ></div>
            </div>

            <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">
                {/* ─── Header ─── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-fade-up">
                    <div>
                        <Link href="/dashboard" className="text-gold text-xs font-semibold uppercase tracking-wider flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity w-fit bg-gold/10 px-3 py-1.5 rounded-full border border-gold/20">
                            <ArrowLeft size={14} /> Back to Dashboard
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-serif font-semibold text-cream tracking-tight mb-3">
                            System Architecture & <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-gold-light">Trust</span>
                        </h1>
                        <p className="text-muted text-sm md:text-base max-w-2xl font-light">
                            Veridict is built on a foundation of absolute determinism, zero-latency local processing, and uncompromising privacy. Explore the exact metrics that power our behavioral and cognitive engines.
                        </p>
                    </div>
                </div>

                {/* ─── BENTO GRID ─── */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">

                    {/* 1. MediaPipe Data Frame */}
                    <div
                        className="md:col-span-8 bg-panel border border-border rounded-2xl p-8 relative overflow-hidden group hover:border-gold/40 transition-all duration-500 animate-fade-up"
                        onMouseEnter={() => setHoveredCard(1)}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/10 transition-colors"></div>
                        <div className="flex items-start justify-between mb-8 relative z-10">
                            <div>
                                <h3 className="text-xs font-bold text-gold uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Activity size={14} /> Deterministic Authenticity
                                </h3>
                                <h2 className="text-2xl font-serif text-cream">Google MediaPipe WebGL</h2>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                                <Eye className="text-gold" size={20} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                            <div className="space-y-1 border-l border-gold/30 pl-4">
                                <div className="text-2xl font-semibold text-cream">30 FPS</div>
                                <div className="text-[10px] text-muted uppercase tracking-wider">Local Processing Rate</div>
                            </div>
                            <div className="space-y-1 border-l border-border pl-4">
                                <div className="text-2xl font-semibold text-cream">468</div>
                                <div className="text-[10px] text-muted uppercase tracking-wider">Face Mesh Landmarks</div>
                            </div>
                            <div className="space-y-1 border-l border-border pl-4">
                                <div className="text-2xl font-semibold text-cream">0 ms</div>
                                <div className="text-[10px] text-muted uppercase tracking-wider">Network Latency</div>
                            </div>
                            <div className="space-y-1 border-l border-border pl-4">
                                <div className="text-2xl font-semibold text-cream">9,000+</div>
                                <div className="text-[10px] text-muted uppercase tracking-wider">Data Points per 5m</div>
                            </div>
                        </div>

                        <p className="text-sm text-text-dim mt-8 relative z-10 font-light leading-relaxed">
                            We do not use generalized AI to "guess" attention. We calculate the exact Iris-to-Sclera ratio and shoulder alignment coordinates mathematically on the client's GPU, resulting in irrefutable, cryptographic-level behavioral proof.
                        </p>
                    </div>

                    {/* 2. Privacy Tile */}
                    <div className="md:col-span-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-500 animate-fade-up delay-100 flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-[100px] blur-2xl"></div>
                        <div>
                            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <ShieldCheck size={14} /> Absolute Privacy
                            </h3>
                            <h2 className="text-2xl font-serif text-cream mb-4">Zero Video Storage</h2>
                            <p className="text-sm text-text-dim font-light leading-relaxed mb-6">
                                The video feed never leaves the user's browser. All facial tracking and posture ML executes explicitly on the client device.
                            </p>
                        </div>
                        <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center justify-center gap-2 text-emerald-400 text-sm font-medium">
                            <Lock size={16} /> GDPR Compliant by Design
                        </div>
                    </div>

                    {/* 3. Dual-Model Architecture */}
                    <div className="md:col-span-6 bg-panel border border-border rounded-2xl p-8 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500 animate-fade-up delay-200">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Network size={14} /> Cognitive Engine
                                </h3>
                                <h2 className="text-2xl font-serif text-cream">Dual-Model Pipeline</h2>
                            </div>
                            <div className="flex -space-x-3">
                                <div className="w-10 h-10 rounded-full border-2 border-panel bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg"><Cpu size={18} className="text-white" /></div>
                                <div className="w-10 h-10 rounded-full border-2 border-panel bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg"><Zap size={18} className="text-white" /></div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">1</div>
                                <div>
                                    <div className="text-sm font-semibold text-cream">Google Gemma 27B</div>
                                    <div className="text-xs text-muted">Handles raw PDF text extraction with 0% hallucination rate.</div>
                                </div>
                            </div>
                            <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">2</div>
                                <div>
                                    <div className="text-sm font-semibold text-cream">Llama 3.3 70B (Groq LPU)</div>
                                    <div className="text-xs text-muted">Performs extremely rigid, strongly-typed JSON rubric reasoning.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Speed & Telemetry */}
                    <div className="md:col-span-6 bg-panel border border-border rounded-2xl p-8 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500 animate-fade-up delay-300">
                        <div className="absolute inset-0 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#smallGrid)" className="text-purple-500" />
                            </svg>
                        </div>

                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Server size={14} /> Telemetry
                                </h3>
                                <h2 className="text-2xl font-serif text-cream mb-6">Processing Latency</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <div className="text-3xl font-bold text-cream mb-1 flex items-baseline gap-1">800<span className="text-sm font-normal text-muted">T/s</span></div>
                                    <div className="text-xs text-muted uppercase tracking-wider">LPU Inference Speed</div>
                                    <div className="w-full h-1 bg-surface mt-2 rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[95%]"></div></div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-cream mb-1 flex items-baseline gap-1">&lt;0.5<span className="text-sm font-normal text-muted">s</span></div>
                                    <div className="text-xs text-muted uppercase tracking-wider">Speech-to-Text Ping</div>
                                    <div className="w-full h-1 bg-surface mt-2 rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[85%]"></div></div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
}
