"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { Chrome, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Helper to map Firebase errors to friendly messages
  const getFriendlyErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "auth/invalid-credential":
        return "Invalid email/password or account does not exist.";
      case "auth/wrong-password":
        return "Invalid password.";
      case "auth/user-not-found":
        return "Account does not exist. Please create one.";
      case "auth/email-already-in-use":
        return "Account already exists. Try signing in.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/network-request-failed":
        return "Network error. Check your connection.";
      case "auth/too-many-requests":
        return "Too many attempts. Try again later.";
      case "auth/popup-closed-by-user":
        return "Sign in cancelled.";
      default:
        return "An error occurred. Please try again.";
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithPopup(auth, googleProvider);
      console.log("Logged in with Google");
      router.push("/dashboard");
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Logged in with Email");
      router.push("/dashboard");
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("Signed up with Email");
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shell grid grid-cols-1 md:grid-cols-2 min-h-screen">
      {/* ─── Left Panel ─── */}
      <div className="hero relative bg-surface flex flex-col justify-between p-12 lg:p-14 overflow-hidden hidden md:flex">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_-10%,_rgba(201,168,76,0.13)_0%,_transparent_60%),_radial-gradient(ellipse_50%_40%_at_80%_110%,_rgba(100,80,200,0.09)_0%,_transparent_55%)] pointer-events-none"></div>
        <div
          className="grid-lines absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        ></div>

        <Link className="logo relative flex items-center gap-2.5 font-serif text-xl font-semibold text-cream tracking-tighter no-underline" href="#">
          <div className="logo-mark w-[34px] h-[34px] bg-gradient-to-br from-gold to-gold-light rounded-[9px] flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1200" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 5l9 14 9-14" />
            </svg>
          </div>
          Veridict
        </Link>

        <div className="hero-content relative flex-1 flex flex-col justify-center py-[60px] pb-10 fade-up-stagger">
          <div className="tag inline-flex items-center gap-2.5 bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.22)] rounded-full px-3.5 py-1.5 text-xs font-medium tracking-[0.06em] uppercase text-gold-light mb-7 w-fit">
            <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse-slow"></span>
            Interview Intelligence
          </div>

          <h1 className="hero-title font-serif text-[clamp(36px,3.5vw,52px)] font-semibold leading-[1.12] text-cream tracking-[-0.02em] mb-[22px]">

            Know exactly <br />
            Where you stand<br />
            <em className="italic text-gold-light">Before you walk in</em>
          </h1>

          <p className="hero-desc text-base text-text-dim leading-[1.7] max-w-[380px] font-light mb-12">
            Real-time speech analysis, confidence scoring, and personalized feedback — helping you turn nerves into results.
          </p>

          <div className="stats flex gap-9">
            <div className="stat-item flex flex-col gap-0.5">
              <div className="stat-num font-serif text-[28px] font-semibold text-cream leading-none">
                94<span className="text-gold">%</span>
              </div>
              <div className="stat-label text-xs text-muted font-normal tracking-[0.03em]">Success rate</div>
            </div>
            <div className="stat-item flex flex-col gap-0.5">
              <div className="stat-num font-serif text-[28px] font-semibold text-cream leading-none">
                2.3<span className="text-gold">M</span>
              </div>
              <div className="stat-label text-xs text-muted font-normal tracking-[0.03em]">Sessions analysed</div>
            </div>
            <div className="stat-item flex flex-col gap-0.5">
              <div className="stat-num font-serif text-[28px] font-semibold text-cream leading-none">
                180<span className="text-gold">+</span>
              </div>
              <div className="stat-label text-xs text-muted font-normal tracking-[0.03em]">Companies</div>
            </div>
          </div>
        </div>

        <div className="testimonial relative bg-[rgba(255,255,255,0.04)] border border-border rounded-2xl p-[22px_24px] backdrop-blur-md">
          <p className="testimonial-text text-sm text-text-dim leading-[1.65] font-light mb-3.5">
            &quot;InterviewIQ showed me exactly where I was losing points — filler words, pacing, body language. Got the offer within two weeks.&quot;
          </p>
          <div className="testimonial-author flex items-center gap-2.5">
            <div className="avatar w-8 h-8 rounded-full bg-gradient-to-br from-[#7c5cbf] to-[#4a8ec2] text-[13px] text-white flex items-center justify-center font-semibold flex-shrink-0">
              SR
            </div>
            <div className="author-info flex flex-col gap-[1px]">
              <div className="author-name text-[13px] font-medium text-text">Sofia Reyes</div>
              <div className="author-role text-xs text-muted">Software Engineer @ Stripe</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right Panel ─── */}
      <div className="auth-panel flex items-center justify-center p-12 lg:p-14 bg-ink">
        <div className="auth-card w-full max-w-[420px] animate-fade-up">

          {/* Tab Switcher */}
          <div className="tabs flex bg-panel border border-border rounded-[10px] p-1 mb-10">
            <button
              onClick={() => setActiveTab("signin")}
              className={`tab-btn flex-1 bg-none border-none rounded-[7px] p-2.5 font-sans text-sm font-medium cursor-pointer transition-all duration-200 ${activeTab === "signin" ? "bg-[rgba(255,255,255,0.07)] text-text" : "text-muted hover:text-text"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`tab-btn flex-1 bg-none border-none rounded-[7px] p-2.5 font-sans text-sm font-medium cursor-pointer transition-all duration-200 ${activeTab === "signup" ? "bg-[rgba(255,255,255,0.07)] text-text" : "text-muted hover:text-text"}`}
            >
              Create Account
            </button>
          </div>

          {/* ─── Forms ─── */}
          <div className="form-heading mb-8">
            <h2 className="form-title font-serif text-[28px] font-semibold text-cream tracking-[-0.02em] mb-1.5">
              {activeTab === "signin" ? "Welcome back" : "Start for free"}
            </h2>
            <p className="form-sub text-sm text-muted font-light">
              {activeTab === "signin" ? "Continue your interview prep journey" : "Your AI interview coach awaits"}
            </p>
          </div>

          {/* OAuth */}
          <div className="oauth-row grid grid-cols-1 gap-2.5 mb-6">
            <button
              onClick={handleGoogleSignIn}
              className="oauth-btn flex items-center justify-center gap-2.5 bg-panel border border-border rounded-[10px] py-[11px] px-4 font-sans text-sm font-medium text-text cursor-pointer transition-all duration-200 hover:bg-[rgba(255,255,255,0.06)] hover:border-border-active hover:-translate-y-px"
            >
              <Chrome className="w-[17px] h-[17px] shrink-0" />
              Continue with Google
            </button>
          </div>

          {/* Error Message */}
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

          <div className="divider flex items-center gap-3.5 mb-6 before:flex-1 before:h-px before:bg-border after:flex-1 after:h-px after:bg-border">
            <span className="text-xs text-muted tracking-[0.05em] whitespace-nowrap">
              {activeTab === "signin" ? "or continue with email" : "or sign up with email"}
            </span>
          </div>

          <form onSubmit={activeTab === "signin" ? handleEmailSignIn : handleEmailSignUp} className="form flex flex-col gap-4">
            {activeTab === "signup" && (
              <div className="field-row grid grid-cols-2 gap-3">
                <div className="field flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-text-dim tracking-[0.02em]">First name</label>
                  <input
                    type="text"
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="bg-panel border border-border rounded-[10px] py-3 px-4 font-sans text-[15px] text-text outline-none transition-all duration-200 placeholder:text-muted placeholder:font-light focus:border-border-active focus:bg-[rgba(255,255,255,0.04)] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.08)] w-full"
                  />
                </div>
                <div className="field flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-text-dim tracking-[0.02em]">Last name</label>
                  <input
                    type="text"
                    placeholder="Smith"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="bg-panel border border-border rounded-[10px] py-3 px-4 font-sans text-[15px] text-text outline-none transition-all duration-200 placeholder:text-muted placeholder:font-light focus:border-border-active focus:bg-[rgba(255,255,255,0.04)] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.08)] w-full"
                  />
                </div>
              </div>
            )}

            <div className="field flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-text-dim tracking-[0.02em]">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-panel border border-border rounded-[10px] py-3 px-4 font-sans text-[15px] text-text outline-none transition-all duration-200 placeholder:text-muted placeholder:font-light focus:border-border-active focus:bg-[rgba(255,255,255,0.04)] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.08)] w-full"
              />
            </div>

            <div className="field flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-text-dim tracking-[0.02em]">Password</label>
              <div className="pw-wrap relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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

            {activeTab === "signin" && (
              <div className="forgot-row flex justify-end -mt-2">
                <a href="#" className="text-[13px] text-gold no-underline font-normal transition-colors duration-200 hover:text-gold-light">Forgot password?</a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="submit-btn w-full bg-gradient-to-br from-gold to-gold-light border-none rounded-[10px] p-3.5 font-sans text-[15px] font-semibold text-[#1a1200] cursor-pointer transition-all duration-200 relative overflow-hidden mt-1 tracking-[0.01em] hover:-translate-y-px after:absolute after:inset-0 after:bg-transparent after:transition-all after:duration-200 hover:after:bg-[rgba(255,255,255,0.08)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : (activeTab === "signin" ? "Sign In" : "Create Account")}
            </button>
          </form>

          <p className="terms text-xs text-muted text-center mt-2.5 leading-[1.6]">
            {activeTab === "signin" ? (
              <>Don&apos;t have an account? <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("signup"); }} className="text-gold no-underline hover:text-gold-light">Create one</a></>
            ) : (
              <>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("signin"); }} className="text-gold no-underline hover:text-gold-light">Sign in</a></>
            )}
          </p>
        </div>
      </div>
    </div >
  );
}
