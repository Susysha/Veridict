"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut, User, updateProfile } from "firebase/auth";
import { getProfile, saveProfile } from "@/lib/userProfile";
import { LogOut, ArrowLeft, Save, User as UserIcon, Zap } from "lucide-react";

const EXPERIENCE_LEVELS = ["Entry-Level", "Mid-Level", "Senior", "Lead / Staff"];

export default function ProfilePage() {
    const router = useRouter();
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [targetRole, setTargetRole] = useState("");
    const [experienceLevel, setExperienceLevel] = useState("Mid-Level");
    const [avatarError, setAvatarError] = useState(false);

    useEffect(() => {
        const unsub = auth.onAuthStateChanged((user) => {
            if (!user) { router.replace("/"); return; }
            setFirebaseUser(user);
            const profile = getProfile();
            setName(profile.name || user.displayName || "");
            setTargetRole(profile.targetRole || "");
            setExperienceLevel(profile.experienceLevel || "Mid-Level");
            setLoading(false);
        });
        return () => unsub();
    }, [router]);

    const handleSave = async () => {
        saveProfile({ name, targetRole, experienceLevel });
        // Also update Firebase display name if changed
        if (firebaseUser && name !== firebaseUser.displayName) {
            try { await updateProfile(firebaseUser, { displayName: name }); } catch { }
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/");
    };

    if (loading) return <div className="min-h-screen bg-ink" />;

    const initials = name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U";

    return (
        <div className="min-h-screen bg-ink text-text font-sans relative">
            {/* Grid bg */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: "40px 40px",
                }}
            />

            <main className="relative z-10 max-w-2xl mx-auto px-6 py-10">

                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-10 animate-fade-up">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Veridict Logo" className="w-9 h-9 rounded-lg object-cover shadow-sm" />
                        <span className="font-serif text-xl font-semibold text-cream tracking-tight">Veridict</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
                        >
                            <ArrowLeft size={14} /> Dashboard
                        </button>
                        <button
                            onClick={handleLogout}
                            title="Sign Out"
                            className="w-9 h-9 rounded-lg border border-border bg-surface flex items-center justify-center text-muted hover:text-red-400 hover:border-red-400/40 hover:bg-red-400/5 transition-all"
                        >
                            <LogOut size={15} />
                        </button>
                    </div>
                </div>

                {/* ── Avatar Section ── */}
                <div className="flex items-center gap-5 mb-8 animate-fade-up">
                    {firebaseUser?.photoURL && !avatarError ? (
                        <img
                            src={firebaseUser.photoURL}
                            alt="Avatar"
                            referrerPolicy="no-referrer"
                            onError={() => setAvatarError(true)}
                            className="w-20 h-20 rounded-2xl border border-border object-cover"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center text-2xl font-bold text-gold font-serif">
                            {initials}
                        </div>
                    )}
                    <div>
                        <h1 className="font-serif text-2xl font-semibold text-cream tracking-tight">{name || "Your Profile"}</h1>
                        <p className="text-xs text-muted mt-0.5">{firebaseUser?.email}</p>
                        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gold bg-gold/10 border border-gold/20 rounded-full px-2.5 py-1 w-fit">
                            <Zap size={11} className="fill-gold" /> Pro Plan
                        </div>
                    </div>
                </div>

                {/* ── Form Card ── */}
                <div className="bg-surface border border-border rounded-xl p-6 space-y-5 animate-fade-up">
                    <h2 className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                        <UserIcon size={13} /> Profile Details
                    </h2>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className="w-full bg-panel border border-border rounded-lg py-2.5 px-4 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Target Role</label>
                        <input
                            type="text"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            placeholder="e.g. Senior Frontend Engineer"
                            className="w-full bg-panel border border-border rounded-lg py-2.5 px-4 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Experience Level</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {EXPERIENCE_LEVELS.map((lvl) => (
                                <button
                                    key={lvl}
                                    onClick={() => setExperienceLevel(lvl)}
                                    className={`py-2 px-2 rounded-lg border text-xs font-medium transition-all ${experienceLevel === lvl
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
                        onClick={handleSave}
                        className={`w-full py-3 rounded-lg border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${saved
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-gold text-ink border-gold hover:bg-gold-light hover:-translate-y-px"
                            }`}
                    >
                        {saved ? (
                            <><span className="w-4 h-4 rounded-full border-2 border-emerald-400 flex items-center justify-center text-[10px]">✓</span> Saved!</>
                        ) : (
                            <><Save size={15} /> Save Changes</>
                        )}
                    </button>
                </div>

                {/* ── Account Section ── */}
                <div className="bg-surface border border-border rounded-xl p-6 mt-4 animate-fade-up">
                    <h2 className="text-xs font-bold text-muted uppercase tracking-widest mb-4">Account</h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-text font-medium">Sign out</p>
                            <p className="text-[11px] text-muted mt-0.5">You&apos;ll be returned to the login screen</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-400/20 bg-red-400/5 text-red-400 text-xs font-medium hover:bg-red-400/10 transition-all"
                        >
                            <LogOut size={13} /> Sign Out
                        </button>
                    </div>
                </div>

            </main>
        </div>
    );
}
