"use client";

import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { getProfile, saveProfile, UserProfile } from "@/lib/userProfile";
import { ArrowRight, Check, Sparkles } from "lucide-react";

interface Props {
    firebaseUser: User | null;
    onComplete: (profile: UserProfile) => void;
}

const EXPERIENCE_LEVELS = ["Entry-Level", "Mid-Level", "Senior", "Lead / Staff"];

export default function OnboardingWizard({ firebaseUser, onComplete }: Props) {
    const [step, setStep] = useState(0);
    const [name, setName] = useState(firebaseUser?.displayName || "");
    const [targetRole, setTargetRole] = useState("");
    const [experienceLevel, setExperienceLevel] = useState("Mid-Level");
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        if (firebaseUser?.displayName) setName(firebaseUser.displayName);
    }, [firebaseUser]);

    const goNext = () => {
        setLeaving(true);
        setTimeout(() => {
            setStep((s) => s + 1);
            setLeaving(false);
        }, 220);
    };

    const finish = () => {
        const profile = saveProfile({
            name,
            targetRole,
            experienceLevel,
            onboardingDone: true,
        });
        onComplete(profile);
    };

    const steps = [
        /* ── Step 0: Welcome ── */
        <div key="step0" className="space-y-6">
            <div>
                <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-3 py-1 text-xs text-gold font-medium mb-4">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
                    Welcome to Veridict
                </div>
                <h2 className="font-serif text-3xl font-semibold text-cream tracking-tight mb-2">
                    Hey there 👋
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                    Let's get you set up in 30 seconds. What should we call you?
                </p>
            </div>
            <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted uppercase tracking-wider">
                    Your name
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex"
                    autoFocus
                    className="w-full bg-panel border border-border rounded-lg py-3 px-4 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none transition-all"
                />
            </div>
            <button
                onClick={goNext}
                disabled={!name.trim()}
                className="w-full py-3 rounded-lg bg-gold text-ink font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gold-light transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
                Continue <ArrowRight size={16} />
            </button>
        </div>,

        /* ── Step 1: Target Role & Level ── */
        <div key="step1" className="space-y-6">
            <div>
                <h2 className="font-serif text-3xl font-semibold text-cream tracking-tight mb-2">
                    What are you aiming for?
                </h2>
                <p className="text-sm text-muted">We'll tailor your interview simulations to match.</p>
            </div>
            <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted uppercase tracking-wider">
                    Target role
                </label>
                <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    autoFocus
                    className="w-full bg-panel border border-border rounded-lg py-3 px-4 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none transition-all"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted uppercase tracking-wider">
                    Experience level
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {EXPERIENCE_LEVELS.map((lvl) => (
                        <button
                            key={lvl}
                            onClick={() => setExperienceLevel(lvl)}
                            className={`py-2.5 px-3 rounded-lg border text-xs font-medium transition-all ${experienceLevel === lvl
                                    ? "bg-gold text-ink border-gold"
                                    : "bg-panel border-border text-muted hover:border-gold/40 hover:text-text"
                                }`}
                        >
                            {lvl}
                        </button>
                    ))}
                </div>
            </div>
            <button
                onClick={goNext}
                disabled={!targetRole.trim()}
                className="w-full py-3 rounded-lg bg-gold text-ink font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gold-light transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
                Almost there <ArrowRight size={16} />
            </button>
        </div>,

        /* ── Step 2: Ready ── */
        <div key="step2" className="space-y-6">
            <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="text-gold" size={28} />
                </div>
                <h2 className="font-serif text-3xl font-semibold text-cream tracking-tight mb-2">
                    You're all set, {name.split(" ")[0]}
                </h2>
                <p className="text-sm text-muted">Your profile is ready. Let's ace those interviews.</p>
            </div>

            {/* Summary card */}
            <div className="bg-panel border border-border rounded-lg divide-y divide-border">
                {[
                    { label: "Name", value: name },
                    { label: "Target Role", value: targetRole },
                    { label: "Experience", value: experienceLevel },
                ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-4 py-3">
                        <span className="text-[11px] text-muted uppercase tracking-wider font-medium">{label}</span>
                        <span className="text-sm text-cream font-medium flex items-center gap-1.5">
                            <Check size={12} className="text-gold" /> {value}
                        </span>
                    </div>
                ))}
            </div>

            <button
                onClick={finish}
                className="w-full py-3.5 rounded-lg bg-gradient-to-br from-gold to-gold-light text-ink font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-gold/10"
            >
                Launch Dashboard <ArrowRight size={16} />
            </button>
        </div>,
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-ink/95 backdrop-blur-xl flex items-center justify-center p-6">
            {/* Subtle grid bg */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: "40px 40px",
                }}
            />

            <div className="w-full max-w-md relative z-10">
                {/* Progress dots */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className={`rounded-full transition-all duration-300 ${i === step
                                    ? "w-6 h-1.5 bg-gold"
                                    : i < step
                                        ? "w-1.5 h-1.5 bg-gold/50"
                                        : "w-1.5 h-1.5 bg-border"
                                }`}
                        />
                    ))}
                </div>

                {/* Step content */}
                <div
                    className={`bg-surface border border-border rounded-2xl p-8 shadow-2xl transition-all duration-220 ${leaving ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
                        }`}
                >
                    {steps[step]}
                </div>
            </div>
        </div>
    );
}
