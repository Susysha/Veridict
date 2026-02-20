"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Mic, MicOff, Video, VideoOff, X, ChevronRight, Play, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

type Question = {
    id: number;
    question: string;
    type: string;
    difficulty: string;
};

import { Suspense } from "react";

function InterviewContent() {

    const searchParams = useSearchParams();
    const router = useRouter();

    // Params
    const mode = searchParams.get("mode") || "Technical";
    const role = searchParams.get("role") || "Software Engineer";
    const difficulty = searchParams.get("difficulty") || "Medium";
    const count = parseInt(searchParams.get("count") || "5");
    const company = searchParams.get("company");

    // State
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [permissionError, setPermissionError] = useState(false);
    const [isStreamActive, setIsStreamActive] = useState(false); // Track if stream is actually playing
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [feedback, setFeedback] = useState<string | null>(null);
    const [answers, setAnswers] = useState<any[]>([]); // Store Q&A
    const [isStartingRecording, setIsStartingRecording] = useState(false);

    // AI Analysis State
    const [postureScore, setPostureScore] = useState(100);
    const [eyeContactScore, setEyeContactScore] = useState(100);
    const [realtimeFeedback, setRealtimeFeedback] = useState<{ message: string; type: "good" | "bad" } | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioCache = useRef<Map<number, string>>(new Map());
    const questionContainerRef = useRef<HTMLHeadingElement>(null);
    const mountedRef = useRef(true);
    const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
    const lastVideoTimeRef = useRef(-1);
    const requestRef = useRef<number | null>(null);

    // 1. Robust Camera Initialization
    const startCamera = async (retries = 3) => {
        if (!mountedRef.current) return;

        console.log(`Attempting to start camera... (${retries} retries left)`);
        setPermissionError(false);

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
                audio: false
            });

            if (!mountedRef.current) {
                stream.getTracks().forEach(track => track.stop());
                return;
            }

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                try {
                    await videoRef.current.play();
                    setIsStreamActive(true);
                } catch (e) {
                    console.error("Video play error:", e);
                }
            }
        } catch (err: any) {
            console.error("Camera Access Error:", err);

            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setPermissionError(true);
            } else if (retries > 0) {
                setTimeout(() => startCamera(retries - 1), 1500);
            } else {
                setIsStreamActive(false);
            }
        }
    };

    // 2. MediaPipe Initialization
    useEffect(() => {
        const initMediaPipe = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                );
                const landmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                        delegate: "GPU"
                    },
                    outputFaceBlendshapes: true,
                    runningMode: "VIDEO",
                    numFaces: 1
                });
                faceLandmarkerRef.current = landmarker;
                setIsAnalyzing(true);
            } catch (error) {
                console.error("Failed to load MediaPipe:", error);
            }
        };

        initMediaPipe();

        return () => {
            if (faceLandmarkerRef.current) {
                faceLandmarkerRef.current.close();
            }
        };
    }, []);

    // 3. Real-time Analysis Loop
    const analyzeFrame = () => {
        if (!isStreamActive || !videoRef.current || !faceLandmarkerRef.current) {
            requestRef.current = requestAnimationFrame(analyzeFrame);
            return;
        }

        const video = videoRef.current;
        if (video.readyState < 2) {
            requestRef.current = requestAnimationFrame(analyzeFrame);
            return;
        }

        if (video.currentTime !== lastVideoTimeRef.current) {
            lastVideoTimeRef.current = video.currentTime;

            const results = faceLandmarkerRef.current.detectForVideo(video, Date.now());

            if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                const landmarks = results.faceLandmarks[0];

                // --- Simple Posture Analysis ---
                // Check if nose (landmark 1) is too far left/right or up/down
                const nose = landmarks[1];
                const leftShoulder = landmarks[11]; // Approximation if available (FaceLandmarker mostly does face, distinct from PoseLandmarker)
                // Actually FaceLandmarker is just face. We can check head rotation and position.

                // Center Check (X: 0.5 is center)
                const isCentered = nose.x > 0.35 && nose.x < 0.65;
                const isUpright = nose.y > 0.2 && nose.y < 0.8;

                // --- Eye Contact Analysis (Blendshapes) ---
                // Using blendshapes is more robust for gaze if available, otherwise geometry
                const blendshapes = results.faceBlendshapes?.[0]?.categories;
                let eyeContact = true;

                if (blendshapes) {
                    const lookLeft = blendshapes.find(b => b.categoryName === 'eyeLookInLeft')?.score || 0;
                    const lookRight = blendshapes.find(b => b.categoryName === 'eyeLookOutLeft')?.score || 0;
                    const lookUp = blendshapes.find(b => b.categoryName === 'eyeLookUp')?.score || 0;
                    const lookDown = blendshapes.find(b => b.categoryName === 'eyeLookDown')?.score || 0;

                    // Stricter Thresholds (0.4 means even slight deviation triggers warning)
                    if (lookLeft > 0.45 || lookRight > 0.45 || lookUp > 0.35 || lookDown > 0.4) {
                        eyeContact = false;
                    }
                }

                // --- Scoring & Feedback ---
                if (!isCentered || !isUpright) {
                    setRealtimeFeedback({ message: "Center yourself in frame", type: "bad" });
                    setPostureScore(prev => Math.max(prev - 0.5, 0));
                } else if (!eyeContact) {
                    setRealtimeFeedback({ message: "Maintain eye contact", type: "bad" });
                    setEyeContactScore(prev => Math.max(prev - 0.8, 0)); // Higher penalty
                } else {
                    // Recovery
                    setRealtimeFeedback(null);
                    setPostureScore(prev => Math.min(prev + 0.1, 100));
                    setEyeContactScore(prev => Math.min(prev + 0.2, 100)); // Faster recovery
                }

            } else {
                // No face detected
                setRealtimeFeedback({ message: "Face not detected", type: "bad" });
            }
        }

        requestRef.current = requestAnimationFrame(analyzeFrame);
    };

    useEffect(() => {
        if (isStreamActive && isAnalyzing) {
            requestRef.current = requestAnimationFrame(analyzeFrame);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isStreamActive, isAnalyzing]);


    useEffect(() => {
        mountedRef.current = true;
        startCamera();
        return () => {
            mountedRef.current = false;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, []);

    // ... Speechmatics logic (kept same as before) ...
    // 4. Web Speech API (STT)
    useEffect(() => {
        if (typeof window !== 'undefined' && !('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            alert("Your browser does not support Speech Recognition. Please use Chrome or Edge.");
        }
    }, []);

    const recognitionRef = useRef<any>(null);
    const isRecordingRef = useRef(false);
    const isStartingRef = useRef(false); // New lock to prevent double-starts

    const startListening = () => {
        if (typeof window === 'undefined') return;

        // Prevent starting if already recording or in the process of starting
        if (isRecordingRef.current || isStartingRef.current) return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition not supported in this browser.");
            setIsStartingRecording(false);
            return;
        }

        isStartingRef.current = true;
        setIsStartingRecording(true);

        try {
            // Clean up existing instance if it somehow exists
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) { }
                recognitionRef.current = null;
            }

            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                isRecordingRef.current = true;
                isStartingRef.current = false;
                setIsRecording(true);
                setIsStartingRecording(false);
            };

            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setTranscript(prev => prev + " " + finalTranscript);
                }
            };

            recognition.onerror = (event: any) => {
                console.error("Speech Recognition Error:", event.error);
                if (event.error === 'not-allowed') {
                    isRecordingRef.current = false;
                    isStartingRef.current = false;
                    setIsRecording(false);
                    setIsStartingRecording(false);
                    alert("Microphone access blocked.");
                } else if (event.error === 'aborted') {
                    // Aborted happens if stop/abort is called, just reset state silently
                    isRecordingRef.current = false;
                    isStartingRef.current = false;
                    setIsRecording(false);
                    setIsStartingRecording(false);
                }
                // We don't stop strictly on 'no-speech' or 'audio-capture' 
            };

            recognition.onend = () => {
                isRecordingRef.current = false;
                isStartingRef.current = false;
                setIsRecording(false);
                setIsStartingRecording(false);
            };

            recognitionRef.current = recognition;
            recognition.start();

        } catch (e) {
            console.error("Failed to start recognition:", e);
            isRecordingRef.current = false;
            isStartingRef.current = false;
            setIsRecording(false);
            setIsStartingRecording(false);
        }
    };

    const stopListening = () => {
        if (!isRecordingRef.current && !isStartingRef.current) return;

        isRecordingRef.current = false;
        isStartingRef.current = false;
        setIsRecording(false);
        setIsStartingRecording(false);

        if (recognitionRef.current) {
            try {
                // Use abort() instead of stop() for immediate termination without firing extra events
                recognitionRef.current.abort();
            } catch (e) { }
            recognitionRef.current = null;
        }
    };

    const fetchAudioBlob = async (text: string) => {
        try {
            const res = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, voice: "sarah" })
            });
            if (!res.ok) return null;
            return await res.blob();
        } catch (e) {
            return null;
        }
    };

    const prefetchAudio = async (index: number) => {
        if (!questions[index] || audioCache.current.has(index)) return;
        const blob = await fetchAudioBlob(questions[index].question);
        if (blob) {
            const url = URL.createObjectURL(blob);
            audioCache.current.set(index, url);
        }
    };

    // 3. Fetch Questions
    useEffect(() => {
        async function fetchQuestions() {
            try {
                const resumeContext = sessionStorage.getItem("interviewContext");
                const context = resumeContext ? JSON.parse(resumeContext) : { skills: [], detailedAnalysis: { summary: "General candidate" } };
                const res = await fetch("/api/generate-questions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ resumeContext: JSON.stringify(context), role, difficulty, count, mode })
                });
                if (res.ok) {
                    const data = await res.json();
                    setQuestions(data.questions);
                } else {
                    setQuestions([]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchQuestions();
    }, [role, difficulty, count, mode]);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const lastSpokenIndex = useRef<number>(-1);

    // Global cleanup to ensure TTS never leaks into other pages
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            if (typeof window !== 'undefined') {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const speakQuestion = async (text: string, index: number) => {
        // Prevent speaking if we are finishing the interview
        if (isGeneratingReport) return;

        try {
            // 1. STOP previous audio immediately
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current = null;
            }
            window.speechSynthesis.cancel(); // Stop any browser TTS

            let url = audioCache.current.get(index);
            if (!url) {
                const blob = await fetchAudioBlob(text);
                if (blob) {
                    url = URL.createObjectURL(blob);
                    audioCache.current.set(index, url);
                }
            }

            // 2. Race Condition Check
            if (currentIndex !== index || isGeneratingReport) return;

            if (url) {
                // Use Server TTS
                const audio = new Audio(url);
                audioRef.current = audio;
                await audio.play().catch(e => console.error("Audio Play Error:", e));
                audio.onended = () => {
                    if (audioRef.current === audio) audioRef.current = null;
                };
            } else {
                // Fallback to Browser TTS
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
                window.speechSynthesis.speak(utterance);
            }

        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        if (questions.length > 0 && !loading && questions[currentIndex]) {
            if (questionContainerRef.current) questionContainerRef.current.scrollTop = 0;
            if (lastSpokenIndex.current !== currentIndex) {
                speakQuestion(questions[currentIndex].question, currentIndex);
                lastSpokenIndex.current = currentIndex;
                setTranscript("");
            }
            const nextIndex = currentIndex + 1;
            if (nextIndex < questions.length) prefetchAudio(nextIndex);
            return () => { if (audioRef.current) audioRef.current.pause(); };
        }
    }, [currentIndex, questions, loading]);

    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    const handleNext = async () => {
        const currentAnswer = {
            questionId: questions[currentIndex].id,
            question: questions[currentIndex].question,
            answer: transcript,
            timestamp: new Date().toISOString(),
            metrics: { postureScore, eyeContactScore }
        };
        const updatedAnswers = [...answers, currentAnswer];
        setAnswers(updatedAnswers);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setTranscript("");
        } else {
            // Finish Interview
            setIsGeneratingReport(true);
            setIsAnalyzing(false); // Stop analysis loop immediately

            // --- STOP ALL TTS AUDIO IMMEDIATELY ---
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current = null;
            }
            if (typeof window !== 'undefined') {
                window.speechSynthesis.cancel();
            }

            // Stop camera tracks to prevent WebGL errors
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }

            try {
                // 1. Auto-download transcript as back-up
                const blob = new Blob([JSON.stringify(updatedAnswers, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `interview-session-${new Date().toISOString()}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                // 2. Generate AI Report
                const res = await fetch("/api/analyze-interview", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        answers: updatedAnswers,
                        postureScore,
                        eyeContactScore,
                        role
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    sessionStorage.setItem("latestInterviewAnalysis", JSON.stringify({ ...data.analysis, role }));
                    router.push("/dashboard?analysis=true");
                } else {
                    const errData = await res.json();
                    console.error("Analysis failed:", errData);
                    alert(`Analysis failed: ${errData.details || "Unknown error"}. Your transcript is saved.`);
                    router.push("/dashboard");
                }
            } catch (error) {
                console.error("Analysis Error:", error);
                alert("An error occurred during analysis. Your transcript is saved.");
                router.push("/dashboard");
            } finally {
                setIsGeneratingReport(false);
            }
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopListening();
        } else {
            setIsStartingRecording(true);
            startListening();
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-full bg-ink flex flex-col items-center justify-center text-cream gap-4">
                <Loader2 className="animate-spin text-gold" size={48} />
                <p className="font-serif text-lg animate-pulse">Generating your interview session...</p>
                <p className="text-sm text-muted">Analyzing profile • Curating questions • Preparing AI</p>
            </div>
        );
    }

    if (permissionError) {
        return (
            <div className="h-screen w-full bg-ink flex flex-col items-center justify-center text-cream gap-6 p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                    <VideoOff size={40} />
                </div>
                <h1 className="text-2xl font-serif">Camera Access Required</h1>
                <p className="text-muted max-w-md">Please enable camera and microphone access to proceed with the interview simulation.</p>
                <button onClick={() => window.location.reload()} className="px-6 py-3 bg-gold text-ink font-medium rounded-lg hover:bg-gold/90 transition-all">Try Again</button>
            </div>
        );
    }

    if (isGeneratingReport) {
        return (
            <div className="h-screen w-full bg-ink flex flex-col items-center justify-center text-cream gap-4 z-50">
                <Loader2 className="animate-spin text-gold" size={48} />
                <h2 className="font-serif text-2xl animate-pulse">Analyzing Performance...</h2>
                <div className="text-center space-y-1 text-sm text-muted">
                    <p>Evaluating Technical Accuracy</p>
                    <p>Measuring Communication Confidence</p>
                    <p>Calculating Body Language Score</p>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];

    return (
        <div className="h-screen w-full bg-ink text-text font-sans relative overflow-hidden flex flex-col">

            {/* Header / Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto">
                    <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center border border-gold/20 backdrop-blur-md">
                        <span className="text-gold font-bold">{currentIndex + 1}</span>
                    </div>
                    <div>
                        <h2 className="text-sm font-medium text-cream uppercase tracking-wider">{mode} Interview</h2>
                        <p className="text-[11px] text-muted">{company ? `${company} • ` : ""}{role}</p>
                    </div>
                </div>
                <button onClick={() => router.push("/dashboard")} className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 text-muted hover:text-red-500 transition-all border border-transparent hover:border-red-500/30 backdrop-blur-md pointer-events-auto">
                    <X size={20} />
                </button>
            </div>

            {/* Main Content Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 pt-24 relative z-10 min-h-0 overflow-hidden">

                {/* Left: Video Feed (2 cols) */}
                <div className="lg:col-span-2 relative rounded-2xl overflow-hidden bg-black/50 border border-white/5 shadow-2xl group flex flex-col justify-center min-h-[300px]">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        onLoadedMetadata={() => {
                            videoRef.current?.play().then(() => setIsStreamActive(true)).catch(() => setIsStreamActive(false));
                        }}
                        onSuspend={() => setIsStreamActive(false)}
                        onStalled={() => setIsStreamActive(false)}
                        onError={(e) => { console.error("Video Error:", e); setIsStreamActive(false); }}
                        className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-300 ${isStreamActive ? 'opacity-100' : 'opacity-0'}`}
                    />

                    {!isStreamActive && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/80 backdrop-blur-sm z-10">
                            <VideoOff className="text-zinc-600 mb-4" size={48} />
                            <p className="text-zinc-400 text-sm mb-4">Camera feed inactive</p>
                            <button onClick={() => startCamera()} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm font-medium flex items-center gap-2 transition-all">
                                <RefreshCw size={14} /> Start Camera
                            </button>
                        </div>
                    )}

                    {isStreamActive && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 backdrop-blur-md z-20">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Live</span>
                        </div>
                    )}

                    {/* AI Feedback Overlay */}
                    {realtimeFeedback && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-3 bg-black/70 backdrop-blur-md rounded-xl border border-red-500/50 text-red-400 font-bold animate-pulse z-30 flex items-center gap-3">
                            <AlertCircle size={20} />
                            {realtimeFeedback.message}
                        </div>
                    )}

                    {/* AI Analysis Stats */}
                    <div className="absolute bottom-4 left-4 flex gap-2 z-20">
                        <div className={`px-3 py-1.5 rounded-lg backdrop-blur-md border text-[10px] font-medium flex items-center gap-1.5 transition-colors ${postureScore > 80 ? 'bg-black/60 border-white/10 text-emerald-400' : 'bg-red-900/40 border-red-500/30 text-red-400'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${postureScore > 80 ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            Posture Score: {Math.round(postureScore)}%
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg backdrop-blur-md border text-[10px] font-medium flex items-center gap-1.5 transition-colors ${eyeContactScore > 80 ? 'bg-black/60 border-white/10 text-blue-400' : 'bg-red-900/40 border-red-500/30 text-red-400'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${eyeContactScore > 80 ? 'bg-blue-400' : 'bg-red-400'}`} />
                            Eye Contact: {Math.round(eyeContactScore)}%
                        </div>
                    </div>
                </div>

                {/* Right: Interaction Panel (1 col) */}
                <div className="flex flex-col gap-4 h-full min-h-0 overflow-hidden">
                    <div className="bg-surface border border-gold/20 rounded-xl p-6 relative overflow-hidden shadow-lg animate-fade-in transition-all duration-500 ease-in-out shrink-0">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Loader2 size={100} className="text-gold animate-spin-slow" /></div>
                        <span className="text-[10px] items-center gap-1.5 inline-flex px-2 py-0.5 rounded border border-gold/20 bg-gold/5 text-gold uppercase tracking-wider font-bold mb-3">
                            Question {currentIndex + 1} of {questions.length}
                        </span>
                        <h3 ref={questionContainerRef} className="text-xl font-serif font-medium text-cream leading-relaxed relative z-10 max-h-32 overflow-y-auto custom-scrollbar">
                            {currentQuestion?.question}
                        </h3>
                        <div className="mt-4 flex gap-2">
                            <button onClick={() => speakQuestion(currentQuestion?.question, currentIndex)} className="text-xs text-muted hover:text-gold flex items-center gap-1 transition-colors">
                                <Play size={12} /> Replay Audio
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 bg-panel border border-border rounded-xl p-5 relative flex flex-col min-h-0 overflow-hidden">
                        <div className="flex justify-between items-center mb-3 shrink-0">
                            <span className="text-xs font-medium text-muted uppercase tracking-wider">Your Answer</span>
                            {isRecording ? <span className="text-[10px] text-red-500 animate-pulse font-medium">Listening...</span> : <span className="text-[10px] text-muted">Microphone standby</span>}
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar text-sm text-text/90 leading-relaxed font-light whitespace-pre-wrap pr-2">
                            {transcript || <span className="text-muted/40 italic">Start speaking to see transcription...</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 shrink-0">
                        <button onClick={toggleRecording} disabled={isStartingRecording} className={`py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${isRecording ? "bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20" : "bg-surface border border-border text-text hover:bg-white/5"} disabled:opacity-50 disabled:cursor-not-allowed`}>
                            {isStartingRecording ? <Loader2 size={18} className="animate-spin" /> : isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                            {isStartingRecording ? "Starting..." : isRecording ? "Stop Recording" : "Start Answer"}
                        </button>
                        <button onClick={handleNext} className="py-3 rounded-xl bg-gold text-ink font-bold uppercase tracking-widest hover:bg-gold-light hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold/10">
                            <span>{currentIndex === questions.length - 1 ? "Finish" : "Next"}</span> <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        </div>
    );
}

export default function InterviewPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-ink flex flex-col items-center justify-center text-gold gap-4">
                <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin"></div>
                <p className="font-serif text-lg animate-pulse">Initializing Interview Environment...</p>
            </div>
        }>
            <InterviewContent />
        </Suspense>
    );
}
