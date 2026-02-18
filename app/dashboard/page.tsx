"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Upload, FileText, Briefcase, Building, Clock,
    TrendingUp, ArrowRight, Plus, Check,
    Code, Users, Monitor, Brain,
    Zap, Award, BarChart3
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { User } from "firebase/auth";

export default function DashboardPage() {
    const [resume, setResume] = useState<File | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState("");
    const [company, setCompany] = useState("");
    const [experience, setExperience] = useState("Mid-Level");
    const [skills, setSkills] = useState("");
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (!currentUser) {
                router.push("/");
            } else {
                setUser(currentUser);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [router]);

    const interviewTypes = [
        { title: "Technical", icon: Code, desc: "Algorithm & Data Structures" },
        { title: "Behavioral", icon: Users, desc: "Cultural fit & Soft skills" },
        { title: "System Design", icon: Monitor, desc: "Architecture & Scalability" },
        { title: "Case Study", icon: Briefcase, desc: "Business problem solving" },
        { title: "Managerial", icon: Brain, desc: "Leadership & Strategy" },
        { title: "Rapid Fire", icon: Zap, desc: "Quick technical questions" }
    ];

    const skillMatrix = [
        { skill: "Algorithms", progress: 75, color: "bg-emerald-500" },
        { skill: "System Design", progress: 45, color: "bg-gold" },
        { skill: "Behavioral", progress: 90, color: "bg-blue-500" },
        { skill: "Communication", progress: 60, color: "bg-purple-500" },
    ];

    const recentAssessments = [
        { id: "FE-201", type: "Frontend System Design", date: "Today, 10:23 AM", score: 92, status: "Passed" },
        { id: "BE-105", type: "Backend API Schema", date: "Yesterday", score: 78, status: "Average" },
        { id: "BH-003", type: "Leadership Principles", date: "Oct 24", score: 88, status: "Passed" },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResume(e.target.files[0]);
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-ink text-text font-sans selection:bg-gold/20 relative">
            {/* ─── Technical Grid Background ─── */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            ></div>

            {/* ─── Main Content ─── */}
            <main className="pt-8 pb-12 px-6 lg:px-10 max-w-7xl mx-auto space-y-8 relative z-10">

                {/* ─── Embedded Header ─── */}
                <div className="flex items-center justify-between mb-8 animate-fade-up">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center shadow-sm">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1200" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 5l9 14 9-14" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="font-serif text-2xl font-semibold text-cream tracking-tight">Veridict</h1>
                            <p className="text-[11px] text-muted uppercase tracking-wider font-medium">Interview Intelligence Console</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-gold bg-gold/10 px-3 py-1.5 rounded-lg border border-gold/20">
                            <Zap size={14} className="fill-gold" />
                            <span>Pro Plan</span>
                        </div>
                        <div className="flex items-center gap-3 pl-4 border-l border-border">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-medium text-cream">{user?.displayName || "User"}</div>
                                <div className="text-[10px] text-muted uppercase tracking-wider">Candidate</div>
                            </div>
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-lg border border-border object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-sm font-medium text-gold">
                                    {user?.displayName ? user.displayName[0] : "U"}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── Stats / Analytics Overview ─── */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-up">
                    <div className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-2 relative overflow-hidden group hover:border-border-active transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-muted uppercase tracking-wider">Total Sessions</span>
                            <BarChart3 size={16} className="text-gold" />
                        </div>
                        <div className="text-2xl font-serif font-semibold text-cream">24</div>
                        <div className="text-xs text-text-dim">+3 this week</div>
                    </div>

                    <div className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-2 relative overflow-hidden group hover:border-border-active transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-muted uppercase tracking-wider">Avg. Score</span>
                            <Award size={16} className="text-emerald-500" />
                        </div>
                        <div className="text-2xl font-serif font-semibold text-cream">86<span className="text-sm text-muted font-sans ml-1">/100</span></div>
                        <div className="text-xs text-emerald-500 flex items-center gap-1">
                            <TrendingUp size={12} /> +12%
                        </div>
                    </div>

                    <div className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-2 relative overflow-hidden group hover:border-border-active transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-muted uppercase tracking-wider">Practice Time</span>
                            <Clock size={16} className="text-blue-500" />
                        </div>
                        <div className="text-2xl font-serif font-semibold text-cream">12h 40m</div>
                        <div className="text-xs text-text-dim">Last: 2h ago</div>
                    </div>

                    <div className="bg-gold/10 border border-gold/30 rounded-lg p-5 flex flex-col justify-center items-start gap-3 relative overflow-hidden cursor-pointer hover:bg-gold/20 transition-colors group">
                        <div className="flex items-center gap-2 text-gold font-medium">
                            <Plus size={18} />
                            <span>New Interview</span>
                        </div>
                        <p className="text-xs text-gold/70 leading-relaxed">
                            Start a new simulation tailored to you.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-up-stagger">

                    {/* ─── Setup Column ─── */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Quick Setup */}
                        <section>
                            <h2 className="text-lg font-serif font-medium text-cream mb-4 flex items-center gap-2">
                                <span className="text-gold">01.</span> Simulation Setup
                            </h2>
                            <div className="bg-surface border border-border rounded-lg p-6 space-y-6">

                                {/* Resume Upload */}
                                <div className="group border border-dashed border-border hover:border-gold/50 rounded-lg p-8 transition-colors text-center cursor-pointer relative bg-panel/30">
                                    <input type="file" accept=".pdf,.docx" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-muted group-hover:text-gold group-hover:border-gold/50 transition-all">
                                            {resume ? <FileText size={20} /> : <Upload size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-text text-sm">{resume ? resume.name : "Upload Resume"}</p>
                                            <p className="text-[11px] text-muted mt-1 uppercase tracking-wider">PDF or DOCX (Max 5MB)</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Target Role</label>
                                        <div className="relative">
                                            <Briefcase size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                                            <input
                                                type="text"
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                                placeholder="e.g. Senior Frontend Dev"
                                                className="w-full bg-panel border border-border rounded-lg py-2.5 pl-9 pr-4 text-sm text-text placeholder:text-muted focus:border-gold focus:ring-0 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Target Company</label>
                                        <div className="relative">
                                            <Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                                            <input
                                                type="text"
                                                value={company}
                                                onChange={(e) => setCompany(e.target.value)}
                                                placeholder="e.g. Google, Netflix"
                                                className="w-full bg-panel border border-border rounded-lg py-2.5 pl-9 pr-4 text-sm text-text placeholder:text-muted focus:border-gold focus:ring-0 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Experience Level</label>
                                        <div className="flex bg-panel border border-border rounded-lg p-1">
                                            {["Fresher", "Mid", "Senior"].map((lvl) => (
                                                <button
                                                    key={lvl}
                                                    onClick={() => setExperience(lvl)}
                                                    className={`flex-1 py-1.5 text-[11px] font-medium rounded-[4px] uppercase tracking-wide transition-all ${experience === lvl ? "bg-gold text-ink font-bold" : "text-muted hover:text-text hover:bg-white/5"}`}
                                                >
                                                    {lvl}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Key Skills</label>
                                        <input
                                            type="text"
                                            value={skills}
                                            onChange={(e) => setSkills(e.target.value)}
                                            placeholder="React, Node.js, System Design..."
                                            className="w-full bg-panel border border-border rounded-lg py-2.5 px-4 text-sm text-text placeholder:text-muted focus:border-gold focus:ring-0 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                            </div>
                        </section>

                        {/* Interview Types */}
                        <section>
                            <h2 className="text-lg font-serif font-medium text-cream mb-4 flex items-center gap-2">
                                <span className="text-gold">02.</span> Select Mode
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {interviewTypes.map((type, idx) => (
                                    <div key={idx} className="bg-surface border border-border hover:border-gold/50 rounded-lg p-4 cursor-pointer transition-all hover:-translate-y-1 group">
                                        <div className="w-8 h-8 rounded-lg bg-panel border border-border flex items-center justify-center text-gold mb-3 group-hover:bg-gold group-hover:text-ink transition-colors">
                                            <type.icon size={16} />
                                        </div>
                                        <h3 className="font-medium text-text text-sm mb-1">{type.title}</h3>
                                        <p className="text-[11px] text-muted leading-relaxed">{type.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Company Focus */}
                        <section>
                            <h2 className="text-lg font-serif font-medium text-cream mb-4 flex items-center gap-2">
                                <span className="text-gold">03.</span> Company Focus
                            </h2>
                            <div className="bg-gradient-to-r from-gold/5 to-transparent border border-gold/20 rounded-lg p-5 relative overflow-hidden group hover:border-gold/50 transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center text-gold border border-gold/10">
                                            <Building size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-cream text-base mb-1">Company Specific Simulation</h3>
                                            <p className="text-xs text-gold/70">Tailored questions based on collected interview data</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={20} className="text-gold opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </div>
                                <div className="space-y-3">
                                    <div className="text-[11px] text-muted uppercase tracking-wider font-medium">Trending Companies</div>
                                    <div className="flex flex-wrap gap-2">
                                        {["Google", "Meta", "Amazon", "Netflix", "Uber"].map((company) => (
                                            <span key={company} className="px-2.5 py-1 rounded bg-surface border border-border text-[11px] text-text hover:text-gold hover:border-gold/50 transition-colors">
                                                {company}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* ─── Sidebar / Analysis ─── */}
                    <div className="space-y-6">

                        {/* Skill Matrix */}
                        <section className="bg-surface border border-border rounded-lg p-5">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-serif font-medium text-cream text-sm">Skill Matrix</h3>
                                <Brain size={16} className="text-muted" />
                            </div>
                            <div className="space-y-4">
                                {skillMatrix.map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-[11px] uppercase tracking-wider font-medium text-muted mb-1.5">
                                            <span>{item.skill}</span>
                                            <span>{item.progress}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-panel rounded-full overflow-hidden">
                                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.progress}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-2.5 rounded-lg border border-border text-[11px] font-medium text-muted hover:text-text hover:bg-panel transition-colors uppercase tracking-wider">
                                View Detailed Report
                            </button>
                        </section>

                        {/* Recent Assessments Table */}
                        <section className="bg-surface border border-border rounded-lg overflow-hidden">
                            <div className="p-4 border-b border-border bg-panel/30 flex items-center justify-between">
                                <h3 className="font-serif font-medium text-cream text-sm">Recent Assessments</h3>
                                <Link href="#" className="text-[10px] text-gold hover:underline uppercase tracking-wide">View All</Link>
                            </div>
                            <div>
                                {recentAssessments.map((session, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-white/5 transition-colors cursor-pointer group">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[13px] font-medium text-text group-hover:text-gold transition-colors">{session.type}</span>
                                            <span className="text-[10px] text-muted font-mono">{session.id} • {session.date}</span>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-0.5">
                                            <span className="text-[13px] font-medium text-cream">{session.score}/100</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-[4px] ${session.status === "Passed" ? "bg-emerald-500/10 text-emerald-500" : "bg-gold/10 text-gold"}`}>
                                                {session.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Pro Tip Module */}
                        <section className="bg-gradient-to-br from-panel to-surface border border-border rounded-lg p-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                <Zap size={80} />
                            </div>
                            <h3 className="text-sm font-medium text-cream mb-2 relative z-10">Daily Tip</h3>
                            <p className="text-xs text-muted leading-relaxed relative z-10 mb-3">
                                &quot;In system design, always clarify functional vs. non-functional requirements first.&quot;
                            </p>
                            <div className="flex gap-2 relative z-10">
                                <span className="text-[10px] border border-border px-2 py-1 rounded bg-panel text-muted">System Design</span>
                                <span className="text-[10px] border border-border px-2 py-1 rounded bg-panel text-muted">Strategy</span>
                            </div>
                        </section>

                        {/* Weekly Goal - Symmetrical Module */}
                        <section className="bg-surface border border-border rounded-lg p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-serif font-medium text-cream text-sm">Weekly Goal</h3>
                                <div className="text-[10px] font-medium text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                                    2 Days Left
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                                        <Check size={14} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-text font-medium">Complete 3 Mock Interviews</p>
                                        <p className="text-[10px] text-muted">2/3 Completed</p>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-panel rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "66%" }}></div>
                                </div>
                                <button className="w-full py-2 rounded border border-dashed border-border text-[11px] text-muted hover:text-text hover:border-gold/50 transition-colors">
                                    + Add New Goal
                                </button>
                            </div>
                        </section>

                    </div>

                </div>
            </main>
        </div>
    );
}
