"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Upload, FileText, Briefcase, Building, Clock,
    TrendingUp, ArrowRight, Plus, Check,
    Code, Users, Monitor, Brain,
    Zap, Award, BarChart3, Mic, BookOpen, LogOut, Flame, ShieldCheck
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { User, signOut } from "firebase/auth";
import { getProfile, recordTodayVisit, getStreak, getWeekDots } from "@/lib/userProfile";
import OnboardingWizard from "@/components/OnboardingWizard";

import { Suspense } from "react";

function DashboardContent() {

    const [resume, setResume] = useState<File | null>(null);
    const [isResumeUploaded, setIsResumeUploaded] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [resumeData, setResumeData] = useState<any>(null); // Re-added for detailed analysis
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState("");
    const [company, setCompany] = useState("");
    const [experience, setExperience] = useState("Mid-Level");
    const [skills, setSkills] = useState("");
    // Modal state
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [selectedMode, setSelectedMode] = useState<string | null>(null);
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [difficulty, setDifficulty] = useState("Medium");
    const [questionCount, setQuestionCount] = useState(5);
    // Onboarding + Streak
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [streak, setStreak] = useState(0);
    const [weekDots, setWeekDots] = useState<boolean[]>([]);
    // Avatar fallback
    const [avatarError, setAvatarError] = useState(false);

    const companies = [
        "Google", "Meta", "Amazon", "Netflix", "Uber",
        "Microsoft", "Apple", "Spotify", "Airbnb", "Stripe"
    ];

    const handleStartInterview = () => {
        if (!resume) {
            alert("Please upload a resume first.");
            return;
        }
        if (!selectedMode) {
            alert("Please select an interview mode.");
            return;
        }
        // Proceed to interview setup
        // Proceed to interview setup
        const companyText = selectedCompany ? ` at ${selectedCompany}` : "";

        // Build URL with parameters
        const params = new URLSearchParams();
        if (selectedMode) params.append("mode", selectedMode);
        if (selectedCompany) params.append("company", selectedCompany);
        if (role) params.append("role", role);
        if (difficulty) params.append("difficulty", difficulty);
        if (questionCount) params.append("count", questionCount.toString());

        // Save context for the interview page
        if (resumeData) {
            sessionStorage.setItem("interviewContext", JSON.stringify(resumeData));
        }

        console.log(`Starting interview with params: ${params.toString()}`);
        router.push(`/interview?${params.toString()}`);
    };
    const handleLogout = async () => {
        try {
            sessionStorage.removeItem("onboarding_shown");
            await signOut(auth);
            router.push("/");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    // URL Params for Analysis
    const searchParams = useSearchParams();
    const router = useRouter();

    // Analysis State
    const [interviewAnalysis, setInterviewAnalysis] = useState<any>(null);
    const [showInterviewAnalysis, setShowInterviewAnalysis] = useState(false);

    useEffect(() => {
        if (searchParams.get("analysis") === "true") {
            const data = sessionStorage.getItem("latestInterviewAnalysis");
            if (data) {
                // Ensure any lingering TTS audio from the interview is immediately killed
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                }

                setInterviewAnalysis(JSON.parse(data));
                setShowInterviewAnalysis(true);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (!currentUser) {
                router.push("/");
            } else {
                setUser(currentUser);
                // Load profile, pre-fill fields — show onboarding once per sign-in session
                const profile = getProfile();

                if (!sessionStorage.getItem("onboarding_shown")) {
                    setShowOnboarding(true);
                }

                if (profile.targetRole) setRole(profile.targetRole);
                if (profile.experienceLevel) setExperience(profile.experienceLevel);
                recordTodayVisit();
                setStreak(getStreak());
                setWeekDots(getWeekDots());
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

    // Dynamic Skill Matrix based on parsing or default
    const skillMatrix = resumeData?.skills ? resumeData.skills.slice(0, 4).map((s: any, i: number) => ({
        skill: s.name,
        progress: s.rating,
        color: ["bg-emerald-500", "bg-gold", "bg-blue-500", "bg-purple-500"][i % 4]
    })) : [
        { skill: "Algorithms", progress: 0, color: "bg-emerald-500/30" },
        { skill: "System Design", progress: 0, color: "bg-gold/30" },
        { skill: "Communication", progress: 0, color: "bg-blue-500/30" },
    ];

    const [recentAssessments, setRecentAssessments] = useState([
        { id: "FE-201", type: "Frontend System Design", date: "Today, 10:23 AM", score: 92, status: "Passed" },
        { id: "BE-105", type: "Backend API Schema", date: "Yesterday", score: 78, status: "Average" },
        { id: "BH-003", type: "Leadership Principles", date: "Oct 24", score: 88, status: "Passed" },
    ]);

    const [goals, setGoals] = useState([
        { id: 1, text: "Complete 3 Mock Interviews", subtext: "2/3 Completed", progress: 66, completed: false },
        { id: 2, text: "Update Resume", subtext: "Pending Review", progress: 0, completed: false },
    ]);
    const [isAddingGoal, setIsAddingGoal] = useState(false);

    const toggleGoal = (id: number) => {
        setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
    };

    const addNewGoal = (text: string) => {
        if (!text.trim()) return;
        setGoals(prev => [...prev, { id: Date.now(), text, subtext: "Just added", progress: 0, completed: false }]);
        setIsAddingGoal(false);
    };

    useEffect(() => {
        const storedAnalysis = sessionStorage.getItem("latestInterviewAnalysis");
        if (storedAnalysis) {
            try {
                const data = JSON.parse(storedAnalysis);
                // Avoid duplicates by checking if ID/timestamp exists (mocking ID here)
                const newId = `AI-${new Date().getMinutes()}${new Date().getSeconds()}`;
                const newAssessment = {
                    id: newId,
                    type: data.role || "Mock Interview",
                    date: "Just Now",
                    score: data.overallScore || 0,
                    status: (data.overallScore || 0) >= 80 ? "Passed" : "Needs Work"
                };

                // Only add if not already present (simple check)
                setRecentAssessments(prev => {
                    // Check if we already have a "Just Now" item to prevent infinite loop/dupes on re-render
                    if (prev.some(p => p.date === "Just Now")) return prev;
                    return [newAssessment, ...prev].slice(0, 5);
                });
            } catch (e) {
                console.error("Failed to parse stored analysis", e);
            }
        }
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setResume(file);
            setIsParsing(true);

            const formData = new FormData();
            formData.append("resume", file);

            try {
                const res = await fetch("/api/parse-resume", {
                    method: "POST",
                    body: formData,
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log("Parsed Data:", data);
                    setResumeData(data); // Store for modal and skills
                    setIsResumeUploaded(true);

                    // Auto-fill form
                    if (data.role) setRole(data.role);
                    if (data.skills && Array.isArray(data.skills)) {
                        setSkills(data.skills.map((s: any) => s.name).join(", "));
                    }
                    if (data.experienceLevel) setExperience(data.experienceLevel);
                } else {
                    const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
                    console.error("Resume Parse Error:", errorData);
                    alert(`Failed to parse resume: ${errorData.details || errorData.error || "Unknown Error"}`);
                    setResume(null);
                }
            } catch (error) {
                console.error("Error uploading resume:", error);
                alert("Error uploading resume.");
                setResume(null);
            } finally {
                setIsParsing(false);
            }
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-ink text-text font-sans selection:bg-gold/20 relative">

            {/* ─── Onboarding Wizard (first-time users only) ─── */}
            {showOnboarding && (
                <OnboardingWizard
                    firebaseUser={user}
                    onComplete={(profile) => {
                        sessionStorage.setItem("onboarding_shown", "1");
                        setShowOnboarding(false);
                        if (profile.targetRole) setRole(profile.targetRole);
                        if (profile.experienceLevel) setExperience(profile.experienceLevel);
                        setStreak(1);
                        setWeekDots(getWeekDots());
                    }}
                />
            )}

            {/* ─── Technical Grid Background ─── */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            ></div>

            {/* ─── Main Content ─── */}
            <main className="pt-8 pb-32 px-6 lg:px-10 max-w-7xl mx-auto space-y-8 relative z-10">

                {/* ─── Embedded Header ─── */}
                <div className="flex items-center justify-between mb-8 animate-fade-up">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Veridict Logo" className="w-10 h-10 rounded-lg object-cover shadow-sm" />
                        <div>
                            <h1 className="font-serif text-2xl font-semibold text-cream tracking-tight">Veridict</h1>
                            <p className="text-[11px] text-muted uppercase tracking-wider font-medium">Interview Intelligence Console</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/statistics"
                            className="hidden sm:flex items-center gap-2 text-xs font-bold text-ink bg-gold hover:bg-gold-light px-4 py-1.5 rounded-lg transition-all shadow-[0_0_15px_rgba(201,168,76,0.3)] hover:-translate-y-0.5"
                        >
                            <ShieldCheck size={14} />
                            ARCHITECTURE & PRIVACY
                        </Link>
                        <div className="flex items-center gap-2 text-xs font-medium text-gold bg-gold/10 px-3 py-1.5 rounded-lg border border-gold/20">
                            <Zap size={14} className="fill-gold" />
                            <span>Pro Plan</span>
                        </div>
                        <div className="flex items-center gap-3 pl-4 border-l border-border">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-medium text-cream">{getProfile().name || user?.displayName || "User"}</div>
                                <div className="text-[10px] text-muted uppercase tracking-wider">Candidate</div>
                            </div>
                            {/* Clickable avatar → /profile */}
                            <button onClick={() => router.push("/profile")} title="Edit Profile" className="shrink-0 relative w-10 h-10">
                                {user?.photoURL && !avatarError ? (
                                    <img
                                        src={user.photoURL}
                                        alt="User"
                                        referrerPolicy="no-referrer"
                                        onError={() => setAvatarError(true)}
                                        className="w-10 h-10 rounded-lg border border-border object-cover hover:border-gold/50 transition-all"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-sm font-semibold text-gold hover:border-gold/50 hover:bg-gold/5 transition-all uppercase">
                                        {(getProfile().name || user?.displayName || "U")[0]}
                                    </div>
                                )}
                            </button>
                            <button
                                onClick={handleLogout}
                                title="Sign Out"
                                className="w-9 h-9 rounded-lg border border-border bg-surface flex items-center justify-center text-muted hover:text-red-400 hover:border-red-400/40 hover:bg-red-400/5 transition-all duration-200"
                            >
                                <LogOut size={15} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ─── Stats / Analytics Overview ─── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-up">
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
                                            <p className="font-medium text-text text-sm">
                                                {resume ? resume.name : "Upload Resume"}
                                                {isParsing && <span className="ml-2 text-gold text-xs animate-pulse">Parsing...</span>}
                                            </p>
                                            <p className="text-[11px] text-muted mt-1 uppercase tracking-wider">
                                                {isResumeUploaded ? <span className="text-emerald-500 font-bold">Resume Analyzed</span> : "PDF or DOCX (Max 5MB)"}
                                            </p>
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
                                                disabled={!isResumeUploaded}
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
                                                disabled={!isResumeUploaded}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Resume Analysis</label>
                                        <button
                                            onClick={() => {
                                                if (isResumeUploaded && resumeData?.detailedAnalysis) {
                                                    setShowAnalysis(true);
                                                }
                                            }}
                                            disabled={!isResumeUploaded || !resumeData?.detailedAnalysis}
                                            className={`w-full h-[38.5px] px-4 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${isResumeUploaded && resumeData?.detailedAnalysis
                                                ? "bg-gold text-ink border-gold hover:bg-gold/90 shadow-sm animate-pulse-subtle"
                                                : "bg-panel border-border text-muted cursor-not-allowed opacity-70"
                                                }`}
                                        >
                                            {isParsing ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-muted border-t-gold rounded-full animate-spin" />
                                                    Analyzing...
                                                </>
                                            ) : isResumeUploaded && resumeData?.detailedAnalysis ? (
                                                <>
                                                    <FileText size={16} />
                                                    View Detailed Report
                                                </>
                                            ) : (
                                                <>
                                                    <Brain size={16} />
                                                    Upload Resume to Unlock
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Key Skills</label>
                                        <input
                                            type="text"
                                            value={skills}
                                            onChange={(e) => setSkills(e.target.value)}
                                            placeholder="React, Node.js, System Design..."
                                            className="w-full h-[38.5px] bg-panel border border-border rounded-lg px-4 text-sm text-text placeholder:text-muted focus:border-gold focus:ring-0 outline-none transition-all"
                                            disabled={!isResumeUploaded}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Difficulty Level</label>
                                        <div className="flex h-[38.5px] items-center bg-panel border border-border rounded-lg p-1">
                                            {["Easy", "Medium", "Hard"].map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() => setDifficulty(level)}
                                                    className={`flex-1 h-full flex items-center justify-center py-1.5 text-xs font-medium rounded-md transition-all ${difficulty === level
                                                        ? "bg-gold text-ink shadow-sm"
                                                        : "text-muted hover:text-text hover:bg-white/5"
                                                        }`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-medium text-muted uppercase tracking-wider">
                                            Question Count: <span className="text-gold">{questionCount}</span>
                                        </label>
                                        <div className="h-[38.5px] bg-panel border border-border rounded-lg px-4 flex items-center">
                                            <input
                                                type="range"
                                                min="3"
                                                max="20"
                                                step="1"
                                                value={questionCount}
                                                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-gold hover:accent-gold-light transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold"
                                            />
                                        </div>
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
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            if (!isResumeUploaded) {
                                                alert("Please upload your resume to select an interview mode.");
                                                return;
                                            }
                                            setSelectedMode(type.title);
                                        }}
                                        className={`bg-surface border rounded-lg p-4 cursor-pointer transition-all hover:-translate-y-1 group relative overflow-hidden ${selectedMode === type.title
                                            ? "border-gold/80 bg-gold/5 shadow-[0_0_15px_rgba(201,168,76,0.1)]"
                                            : "border-border hover:border-gold/30"
                                            }`}
                                    >
                                        {selectedMode === type.title && (
                                            <div className="absolute top-2 right-2">
                                                <div className="w-2 h-2 rounded-full bg-gold shadow-[0_0_8px_rgba(201,168,76,0.8)] animate-pulse" />
                                            </div>
                                        )}
                                        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center mb-3 transition-colors ${selectedMode === type.title
                                            ? "bg-gold text-ink border-gold"
                                            : "bg-panel border-border text-gold group-hover:bg-gold group-hover:text-ink"
                                            }`}>
                                            <type.icon size={16} />
                                        </div>
                                        <h3 className={`font-medium text-sm mb-1 ${selectedMode === type.title ? "text-white" : "text-text"}`}>{type.title}</h3>
                                        <p className="text-[11px] text-muted leading-relaxed">{type.desc}</p>
                                    </div>
                                ))}
                            </div>

                        </section>

                        {/* Company Focus */}
                        <section>
                            <h2 className="text-lg font-serif font-medium text-cream mb-4 flex items-center gap-2">
                                <span className="text-gold">03.</span> Company Focus <span className="text-xs text-muted ml-2 font-sans tracking-wide uppercase">(Optional)</span>
                            </h2>
                            <div
                                className="bg-gradient-to-r from-gold/5 to-transparent border border-gold/20 rounded-lg p-5 relative overflow-hidden group hover:border-gold/50 transition-all"
                            >
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
                                </div>
                                <div className="space-y-3">
                                    <div className="text-[11px] text-muted uppercase tracking-wider font-medium">Trending Companies</div>
                                    <div className="flex flex-wrap gap-2">
                                        {companies.map((comp) => (
                                            <button
                                                key={comp}
                                                onClick={() => {
                                                    if (!isResumeUploaded) {
                                                        alert("Please upload your resume to select a company.");
                                                        return;
                                                    }
                                                    setSelectedCompany(selectedCompany === comp ? null : comp);
                                                }}
                                                className={`px-3 py-1.5 rounded-md text-[11px] border transition-all ${selectedCompany === comp
                                                    ? "bg-gold text-ink border-gold font-medium shadow-sm"
                                                    : "bg-surface border-border text-text hover:text-gold hover:border-gold/50"
                                                    }`}
                                            >
                                                {comp}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Start Button - Bottom of Main Column */}
                        <div className={`transition-all duration-500 ease-in-out ${selectedMode ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
                            <button
                                onClick={handleStartInterview}
                                className="w-full py-4 rounded-xl bg-gold text-ink font-bold uppercase tracking-widest hover:bg-gold-light hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-gold/10 flex items-center justify-center gap-3"
                            >
                                <span>Start {selectedMode} Session {selectedCompany ? `@ ${selectedCompany}` : ""}</span>
                                <ArrowRight size={20} />
                            </button>
                        </div>
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
                                {skillMatrix.map((item: any, i: number) => (
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
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-[4px] whitespace-nowrap ${session.status === "Passed" ? "bg-emerald-500/10 text-emerald-500" : "bg-gold/10 text-gold"}`}>
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

                        {/* Weekly Goal + Live Streak */}
                        <section className="bg-surface border border-border rounded-lg p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-serif font-medium text-cream text-sm">Weekly Goal</h3>
                                <div className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${streak >= 3
                                    ? "text-orange-400 bg-orange-400/10 border-orange-400/20"
                                    : streak >= 1
                                        ? "text-gold bg-gold/10 border-gold/20"
                                        : "text-muted bg-panel border-border"
                                    }`}>
                                    <Flame size={12} className={streak >= 1 ? "fill-current" : ""} />
                                    {streak > 0 ? `${streak}-day streak` : "Start streak"}
                                </div>
                            </div>
                            {/* 7-day dot grid Mon–Sun */}
                            <div className="flex items-center gap-1.5 mb-4">
                                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                                        <div className={`w-full h-1.5 rounded-full transition-all ${weekDots[i] ? "bg-gold shadow-[0_0_6px_rgba(201,168,76,0.5)]" : "bg-panel"
                                            }`} />
                                        <span className="text-[9px] text-muted">{d}</span>
                                    </div>
                                ))}
                            </div>
                            {/* Goals List (State-based) */}
                            <div className="space-y-4">
                                {goals.map((goal) => (
                                    <div key={goal.id} className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs ${goal.completed ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20' : 'bg-gold/10 text-gold border-gold/20'}`}>
                                                {goal.completed ? <Check size={14} /> : <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-xs font-medium ${goal.completed ? 'text-text/60 line-through' : 'text-text'}`}>{goal.text}</p>
                                                <p className="text-[10px] text-muted">{goal.subtext}</p>
                                            </div>
                                            <button onClick={() => toggleGoal(goal.id)} className="text-[10px] text-muted hover:text-text">{goal.completed ? "Undo" : "Mark Done"}</button>
                                        </div>
                                        {!goal.completed && (
                                            <div className="h-1.5 w-full bg-panel rounded-full overflow-hidden">
                                                <div className="h-full bg-gold rounded-full" style={{ width: `${goal.progress}%` }}></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {isAddingGoal ? (
                                <div className="flex gap-2 animate-fade-in">
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Enter new goal..."
                                        className="flex-1 bg-black/20 border border-border rounded px-3 py-1.5 text-xs text-cream outline-none focus:border-gold/50"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                addNewGoal((e.target as HTMLInputElement).value);
                                            }
                                        }}
                                        onBlur={() => setIsAddingGoal(false)}
                                    />
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAddingGoal(true)}
                                    className="w-full py-2 rounded border border-dashed border-border text-[11px] text-muted hover:text-text hover:border-gold/50 transition-colors"
                                >
                                    + Add New Goal
                                </button>
                            )}
                        </section>

                    </div>

                </div>
            </main>


            {/* ─── Detailed Analysis Modal ─── */}
            {
                showAnalysis && resumeData?.detailedAnalysis && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                        <div className="bg-surface border border-border rounded-xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl relative animate-fade-up flex flex-col">

                            {/* Header */}
                            <div className="p-6 border-b border-border bg-panel flex items-start justify-between shrink-0">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center text-gold border border-gold/20 shrink-0">
                                        <FileText size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-serif font-medium text-cream mb-1">{resumeData.name || "Candidate Report"}</h2>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-gold uppercase tracking-wider font-medium">{resumeData.role}</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface border border-border text-muted uppercase tracking-wide whitespace-nowrap">
                                                {String(resumeData.experienceLevel).toLowerCase()} Level
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAnalysis(false)}
                                    className="text-muted hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg shrink-0"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {/* Scrollable Body */}
                            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar grow">

                                {/* Summary */}
                                <section>
                                    <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Brain size={14} className="text-gold" />
                                        Professional Summary
                                    </h3>
                                    <div className="p-5 bg-panel/50 border border-border rounded-lg">
                                        <p className="text-sm text-text/90 leading-relaxed font-light">
                                            {resumeData.detailedAnalysis.summary}
                                        </p>
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Strengths */}
                                    <section className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-5">
                                        <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <TrendingUp size={14} />
                                            Key Strengths
                                        </h3>
                                        <ul className="space-y-3">
                                            {resumeData.detailedAnalysis.strengths.map((str: string, i: number) => (
                                                <li key={i} className="text-sm text-text/90 flex items-start gap-3">
                                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                                    <span className="leading-snug">{str}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>

                                    {/* Weaknesses */}
                                    <section className="bg-red-500/5 border border-red-500/10 rounded-lg p-5">
                                        <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Target size={14} />
                                            Growth Areas
                                        </h3>
                                        <ul className="space-y-3">
                                            {resumeData.detailedAnalysis.weaknesses.map((wk: string, i: number) => (
                                                <li key={i} className="text-sm text-text/90 flex items-start gap-3">
                                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 shadow-[0_0_8px_rgba(248,113,113,0.4)]" />
                                                    <span className="leading-snug">{wk}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                </div>

                                {/* Recommendations */}
                                <section>
                                    <h3 className="text-xs font-bold text-gold uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Zap size={14} />
                                        AI Action Plan
                                    </h3>
                                    <div className="grid gap-3">
                                        {resumeData.detailedAnalysis.recommendations.map((rec: string, i: number) => (
                                            <div key={i} className="group flex items-start gap-4 p-4 bg-surface border border-border hover:border-gold/30 rounded-lg transition-colors">
                                                <div className="mt-0.5 w-6 h-6 rounded bg-gold/10 text-gold flex items-center justify-center text-[10px] font-bold border border-gold/20 shrink-0 group-hover:bg-gold group-hover:text-ink transition-colors">
                                                    {i + 1}
                                                </div>
                                                <p className="text-sm text-text/80 group-hover:text-text transition-colors leading-relaxed">{rec}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-border bg-panel flex justify-end shrink-0">
                                <button
                                    onClick={() => setShowAnalysis(false)}
                                    className="px-6 py-2 rounded-lg bg-surface border border-border text-xs font-bold uppercase tracking-wider text-muted hover:bg-gold hover:text-ink hover:border-gold transition-all"
                                >
                                    Close Report
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* ─── Interview Analysis Modal (Full Screen) ─── */}
            {
                showInterviewAnalysis && interviewAnalysis && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink/95 backdrop-blur-2xl animate-fade-in overflow-hidden">
                        {/* Backdrop Grid */}
                        <div
                            className="absolute inset-0 pointer-events-none opacity-[0.03]"
                            style={{
                                backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                                backgroundSize: '40px 40px'
                            }}
                        ></div>

                        <div className="w-full max-w-6xl max-h-[90vh] bg-ink border border-gold/10 rounded-3xl shadow-2xl relative flex flex-col overflow-hidden z-10">

                            {/* Technical Grid Background */}
                            <div
                                className="absolute inset-0 pointer-events-none opacity-[0.05]"
                                style={{
                                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                                    backgroundSize: '40px 40px'
                                }}
                            ></div>

                            {/* Header */}
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-surface/50 backdrop-blur-md sticky top-0 z-10">
                                <div>
                                    <h2 className="text-2xl font-serif font-medium text-cream mb-1">Performance Report</h2>
                                    <div className="flex items-center gap-3 text-xs text-muted">
                                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date().toLocaleDateString()}</span>
                                        <span className="w-1 h-1 rounded-full bg-white/20" />
                                        <span>{interviewAnalysis.role || "Candidate"}</span>
                                    </div>
                                </div>
                                <button onClick={() => { setShowInterviewAnalysis(false); router.replace("/dashboard"); }} className="p-2 hover:bg-white/10 rounded-full transition-colors group">
                                    <X size={24} className="text-muted group-hover:text-white transition-colors" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 relative z-10">

                                {/* Top Stats Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-surface/50 border border-white/5 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden group hover:border-gold/20 transition-colors">
                                        <div className="w-12 h-12 rounded-full border-2 border-gold/20 flex items-center justify-center text-gold font-bold text-lg group-hover:border-gold/50 transition-colors bg-gold/5 shrink-0">
                                            {interviewAnalysis.overallScore}
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted uppercase tracking-wider font-medium">Overall Score</div>
                                            <div className="text-sm text-cream opacity-80">Weighted Performance</div>
                                        </div>
                                        <div className="absolute right-0 top-0 p-4 opacity-5"><TrendingUp size={48} /></div>
                                    </div>

                                    <div className="bg-surface/50 border border-white/5 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden group hover:border-gold/20 transition-colors">
                                        <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg group-hover:border-blue-500/50 transition-colors bg-blue-500/5 shrink-0">
                                            {interviewAnalysis.vocabularyLevel?.[0]}
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted uppercase tracking-wider font-medium">Vocabulary</div>
                                            <div className="text-sm text-cream opacity-80">{interviewAnalysis.vocabularyLevel} Level</div>
                                        </div>
                                        <div className="absolute right-0 top-0 p-4 opacity-5"><BookOpen size={48} /></div>
                                    </div>

                                    <div className="bg-surface/50 border border-white/5 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden group hover:border-gold/20 transition-colors">
                                        <div className="w-12 h-12 rounded-full border-2 border-red-500/20 flex items-center justify-center text-red-400 font-bold text-lg group-hover:border-red-500/50 transition-colors bg-red-500/5 shrink-0">
                                            {interviewAnalysis.estimatedFillerWords}
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted uppercase tracking-wider font-medium">Filler Words</div>
                                            <div className="text-sm text-cream opacity-80">Estimated usage</div>
                                        </div>
                                        <div className="absolute right-0 top-0 p-4 opacity-5"><Mic size={48} /></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                                    {/* Left Column (5/12) */}
                                    <div className="lg:col-span-5 space-y-6">
                                        {/* Radar Chart Card */}
                                        <div className="bg-surface border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center relative min-h-[400px]">
                                            <h3 className="absolute top-6 left-6 text-xs font-bold text-muted uppercase tracking-widest">Competency Map</h3>

                                            {/* SVG Radar Chart */}
                                            <div className="relative w-full max-w-[320px] aspect-square">
                                                {/* Radar Background (Pentagon) */}
                                                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                                                    <polygon points="50,5 95,40 80,90 20,90 5,40" fill="none" stroke="#333" strokeWidth="0.5" />
                                                    <polygon points="50,20 80,45 70,80 30,80 20,45" fill="none" stroke="#222" strokeWidth="0.5" />
                                                    <line x1="50" y1="50" x2="50" y2="5" stroke="#222" strokeWidth="0.5" />
                                                    <line x1="50" y1="50" x2="95" y2="40" stroke="#222" strokeWidth="0.5" />
                                                    <line x1="50" y1="50" x2="80" y2="90" stroke="#222" strokeWidth="0.5" />
                                                    <line x1="50" y1="50" x2="20" y2="90" stroke="#222" strokeWidth="0.5" />
                                                    <line x1="50" y1="50" x2="5" y2="40" stroke="#222" strokeWidth="0.5" />

                                                    {/* Data Polygon */}
                                                    {(() => {
                                                        const s = interviewAnalysis;
                                                        // Normalize scores to 0-1
                                                        const tech = (s.technicalScore || 0) / 100;
                                                        const comm = (s.communicationScore || 0) / 100;
                                                        const body = (s.bodyLanguageScore || 0) / 100;
                                                        const vocab = s.vocabularyLevel === "Expert" ? 1 : s.vocabularyLevel === "Advanced" ? 0.8 : s.vocabularyLevel === "Intermediate" ? 0.6 : 0.4;
                                                        const overall = (s.overallScore || 0) / 100;

                                                        // Calculate points (simplified logic for 5-axis radar)
                                                        // Top: Technical
                                                        const p1 = `50,${50 - (tech * 45)}`;
                                                        // Right-Top: Communication
                                                        const p2 = `${50 + (comm * 43)},${50 - (comm * 15)}`;
                                                        // Right-Bottom: Body Language
                                                        const p3 = `${50 + (body * 25)},${50 + (body * 40)}`;
                                                        // Left-Bottom: Vocabulary
                                                        const p4 = `${50 - (vocab * 25)},${50 + (vocab * 40)}`;
                                                        // Left-Top: Overall (Confidence proxy)
                                                        const p5 = `${50 - (overall * 43)},${50 - (overall * 15)}`;

                                                        return (
                                                            <>
                                                                <polygon points={`${p1} ${p2} ${p3} ${p4} ${p5}`} fill="rgba(201, 168, 76, 0.2)" stroke="#C9A84C" strokeWidth="2" strokeLinejoin="round" />
                                                                <circle cx="50" cy={50 - (tech * 45)} r="3" fill="#INK" stroke="#C9A84C" strokeWidth="2" />
                                                                <circle cx={50 + (comm * 43)} cy={50 - (comm * 15)} r="3" fill="#INK" stroke="#C9A84C" strokeWidth="2" />
                                                                <circle cx={50 + (body * 25)} cy={50 + (body * 40)} r="3" fill="#INK" stroke="#C9A84C" strokeWidth="2" />
                                                                <circle cx={50 - (vocab * 25)} cy={50 + (vocab * 40)} r="3" fill="#INK" stroke="#C9A84C" strokeWidth="2" />
                                                                <circle cx={50 - (overall * 43)} cy={50 - (overall * 15)} r="3" fill="#INK" stroke="#C9A84C" strokeWidth="2" />
                                                            </>
                                                        );
                                                    })()}
                                                </svg>

                                                {/* Labels */}
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-6 text-[11px] text-cream font-medium tracking-wide bg-surface px-2 py-0.5 rounded border border-white/5">Technical</div>
                                                <div className="absolute top-[30%] right-0 -mr-10 text-[11px] text-cream font-medium tracking-wide bg-surface px-2 py-0.5 rounded border border-white/5">Comm.</div>
                                                <div className="absolute bottom-[10%] right-0 -mr-8 text-[11px] text-cream font-medium tracking-wide bg-surface px-2 py-0.5 rounded border border-white/5">Body</div>
                                                <div className="absolute bottom-[10%] left-0 -ml-6 text-[11px] text-cream font-medium tracking-wide bg-surface px-2 py-0.5 rounded border border-white/5">Vocab</div>
                                                <div className="absolute top-[30%] left-0 -ml-10 text-[11px] text-cream font-medium tracking-wide bg-surface px-2 py-0.5 rounded border border-white/5">Confidence</div>
                                            </div>
                                        </div>

                                        {/* Executive Summary Card */}
                                        <div className="bg-surface border border-white/5 rounded-2xl p-6">
                                            <h3 className="text-sm font-bold text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Brain size={16} className="text-gold" /> Executive Summary
                                            </h3>
                                            <p className="text-text/90 leading-relaxed font-light text-sm italic">
                                                "{interviewAnalysis.summary}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right Column (7/12) */}
                                    <div className="lg:col-span-7 space-y-6">

                                        {/* Strengths & Weaknesses Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
                                                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2"><TrendingUp size={16} /> Key Strengths</h3>
                                                <ul className="space-y-3">
                                                    {interviewAnalysis.strengths?.map((s: string, i: number) => (
                                                        <li key={i} className="flex gap-3 text-sm text-text/90 items-start">
                                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                                            <span className="leading-snug">{s}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
                                                <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Target size={16} /> Growth Areas</h3>
                                                <ul className="space-y-3">
                                                    {interviewAnalysis.weaknesses?.map((w: string, i: number) => (
                                                        <li key={i} className="flex gap-3 text-sm text-text/90 items-start">
                                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 shadow-[0_0_8px_rgba(248,113,113,0.4)]" />
                                                            <span className="leading-snug">{w}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Detailed Question Feedback */}
                                        <div className="bg-surface border border-white/5 rounded-2xl p-6 flex-1 flex flex-col min-h-[300px]">
                                            <h3 className="text-sm font-bold text-muted uppercase tracking-widest mb-6 flex items-center justify-between">
                                                <span>Question Analysis</span>
                                                <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-muted">Scroll to view all</span>
                                            </h3>
                                            <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 max-h-[400px]">
                                                {interviewAnalysis.questionFeedback?.map((q: any, i: number) => (
                                                    <div key={i} className="p-4 bg-panel border border-white/5 rounded-xl hover:border-gold/20 transition-all group">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <span className="w-6 h-6 rounded flex items-center justify-center bg-gold/10 text-gold text-xs font-bold border border-gold/20">Q{i + 1}</span>
                                                                <span className={`text-xs px-2 py-0.5 rounded font-medium ${q.score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : q.score >= 60 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                                    Score: {q.score}/100
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-text/80 leading-relaxed pl-9 border-l-2 border-white/5">
                                                            {q.questionFeedback || q.feedback}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-ink flex flex-col items-center justify-center text-gold gap-4">
                <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin"></div>
                <p className="font-serif text-lg animate-pulse">Loading Interview Intelligence...</p>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}

// Add Target icon since simple Lucide import might miss it or name conflict
const Target = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);

// Add X icon
const X = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);
