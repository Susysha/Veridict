"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [validCode, setValidCode] = useState<boolean | null>(null);

    const searchParams = useSearchParams();
    const router = useRouter();
    const oobCode = searchParams.get("oobCode");

    useEffect(() => {
        if (oobCode) {
            // Verify the password reset code is valid
            verifyPasswordResetCode(auth, oobCode)
                .then(() => setValidCode(true))
                .catch(() => {
                    setValidCode(false);
                    setError("Invalid or expired password reset link. Please request a new one.");
                });
        } else {
            setValidCode(false);
            setError("No reset code found in the URL.");
        }
    }, [oobCode]);

    // Helper to map Firebase errors to friendly messages
    const getFriendlyErrorMessage = (errorCode: string) => {
        switch (errorCode) {
            case "auth/expired-action-code":
                return "The password reset link has expired. Please request a new one.";
            case "auth/invalid-action-code":
                return "The password reset link is invalid. It may have already been used.";
            case "auth/user-disabled":
                return "This account has been disabled.";
            case "auth/user-not-found":
                return "Account does not exist.";
            case "auth/weak-password":
                return "Password should be at least 6 characters.";
            default:
                return "An error occurred. Please try again.";
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!oobCode) {
            setError("Invalid password reset link.");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await confirmPasswordReset(auth, oobCode, password);
            setSuccess(true);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            setError(getFriendlyErrorMessage(err.code));
        } finally {
            setLoading(false);
        }
    };

    // Checking code state
    if (validCode === null) {
        return (
            <div className="min-h-screen bg-ink flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_-10%,_rgba(201,168,76,0.13)_0%,_transparent_60%),_radial-gradient(ellipse_50%_40%_at_80%_110%,_rgba(100,80,200,0.09)_0%,_transparent_55%)] pointer-events-none"></div>
                <div
                    className="grid-lines absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                ></div>
                <div className="text-muted text-sm flex items-center gap-2 relative z-10">
                    <span className="w-4 h-4 rounded-full border-2 border-gold border-t-transparent animate-spin"></span>
                    Verifying reset link...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ink flex items-center justify-center p-4 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_-10%,_rgba(201,168,76,0.13)_0%,_transparent_60%),_radial-gradient(ellipse_50%_40%_at_80%_110%,_rgba(100,80,200,0.09)_0%,_transparent_55%)] pointer-events-none z-0"></div>
            <div
                className="grid-lines absolute inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }}
            ></div>

            <div className="auth-card w-full max-w-[420px] bg-panel border border-border rounded-xl p-8 shadow-xl animate-fade-up relative z-10">

                <div className="flex justify-center mb-8">
                    <Link href="/" className="logo relative flex items-center gap-2.5 font-serif text-xl font-semibold text-cream tracking-tighter no-underline">
                        <img src="/logo.png" alt="Veridict Logo" className="w-8 h-8 rounded-lg object-cover" />
                        Veridict
                    </Link>
                </div>

                <div className="form-heading mb-8">
                    <h2 className="form-title font-serif text-[28px] font-semibold text-cream tracking-[-0.02em] mb-1.5 text-center">
                        {success ? "Password Reset Complete" : "Reset Your Password"}
                    </h2>
                    <p className="form-sub text-sm text-muted font-light text-center">
                        {success
                            ? "You can now log in with your new password."
                            : validCode
                                ? "Enter your new password below."
                                : "There's an issue with your reset link."}
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg mb-6 animate-fade-up">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {success ? (
                    <div className="flex flex-col gap-4 animate-fade-up">
                        <div className="flex items-center justify-center p-4 rounded-full bg-green-500/10 text-green-400 w-16 h-16 mx-auto mb-2 border border-green-500/20">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <Link
                            href="/"
                            className="submit-btn text-center w-full bg-gradient-to-br from-gold to-gold-light border-none rounded-[10px] p-3.5 font-sans text-[15px] font-semibold text-[#1a1200] cursor-pointer transition-all duration-200 hover:-translate-y-px"
                        >
                            Return to Login
                        </Link>
                    </div>
                ) : validCode ? (
                    <form onSubmit={handleResetPassword} className="form flex flex-col gap-4">
                        <div className="field flex flex-col gap-1.5">
                            <label className="text-[13px] font-medium text-text-dim tracking-[0.02em]">New Password</label>
                            <div className="pw-wrap relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoFocus
                                    className="bg-panel border border-border rounded-[10px] py-3 px-4 pr-11 font-sans text-[15px] text-text outline-none transition-all duration-200 placeholder:text-muted placeholder:font-light focus:border-border-active focus:bg-[rgba(255,255,255,0.04)] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.08)] w-full"
                                />
                                <button
                                    type="button"
                                    className="pw-toggle absolute right-3.5 top-1/2 -translate-y-1/2 bg-none border-none text-muted cursor-pointer p-0.5 flex transition-colors duration-200 hover:text-text"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label="Show password"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="field flex flex-col gap-1.5">
                            <label className="text-[13px] font-medium text-text-dim tracking-[0.02em]">Confirm Password</label>
                            <div className="pw-wrap relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="bg-panel border border-border rounded-[10px] py-3 px-4 pr-11 font-sans text-[15px] text-text outline-none transition-all duration-200 placeholder:text-muted placeholder:font-light focus:border-border-active focus:bg-[rgba(255,255,255,0.04)] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.08)] w-full"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || password.length < 6}
                            className="submit-btn w-full bg-gradient-to-br from-gold to-gold-light border-none rounded-[10px] p-3.5 font-sans text-[15px] font-semibold text-[#1a1200] cursor-pointer transition-all duration-200 relative overflow-hidden mt-4 tracking-[0.01em] hover:-translate-y-px disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? "Updating Password..." : "Update Password"}
                        </button>
                    </form>
                ) : (
                    <div className="flex justify-center mt-4">
                        <Link
                            href="/"
                            className="text-sm text-gold hover:text-gold-light transition-colors"
                        >
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
