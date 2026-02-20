import sys
import re

file_path = r'c:\Users\ojasv\Desktop\Interview V2\app\interview\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add `code` state
state_match = "const [transcript, setTranscript] = useState(\"\");"
if state_match in content:
    content = content.replace(state_match, state_match + "\n    const [code, setCode] = useState(\"\");")
else:
    print("Could not find transcript state.")
    sys.exit(1)

# 2. Add Code Icon import
# Code is already imported somewhere? Wait, let's check.
icon_match = "Mic, MicOff, Video, VideoOff, X, ChevronRight, Play, Loader2, AlertCircle, RefreshCw"
if icon_match in content:
    content = content.replace(icon_match, "Mic, MicOff, Video, VideoOff, X, ChevronRight, Play, Loader2, AlertCircle, RefreshCw, Code")

# 3. Fix Audio Overlap (Aggressive Cancellation)
audio_overlap_fix = """
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
"""

new_speak_question = """
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

    const stopAllAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        if (typeof window !== 'undefined') {
            window.speechSynthesis.cancel();
        }
    };

    const speakQuestion = async (text: string, index: number) => {
"""

if audio_overlap_fix in content:
    content = content.replace(audio_overlap_fix, new_speak_question)

# Inside speakQuestion, it already has:
#             if (audioRef.current) {
#                 audioRef.current.pause();
#                 audioRef.current.currentTime = 0;
#                 audioRef.current = null;
#             }
#             window.speechSynthesis.cancel(); // Stop any browser TTS

# But handleNext doesn't aggressively stop before the next question loads if the useEffect triggers fast enough.
# Let's intercept handleNext:
handle_next_match = """
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setTranscript("");
        } else {
"""
new_handle_next = """
        // Stop current audio *before* advancing
        stopAllAudio();
        
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setTranscript("");
            setCode(""); // Clear code buffer for next question
        } else {
"""
if handle_next_match in content:
    content = content.replace(handle_next_match, new_handle_next)

# Ensure handleNext saves the code!
answer_save_match = """
        const currentAnswer = {
            questionId: questions[currentIndex].id,
            question: questions[currentIndex].question,
            answer: transcript,
            timestamp: new Date().toISOString(),
            metrics: { postureScore, eyeContactScore }
        };
"""
new_answer_save = """
        const currentAnswer = {
            questionId: questions[currentIndex].id,
            question: questions[currentIndex].question,
            answer: transcript + (code.trim() ? "\\n\\n[Candidate's Code Submission]:\\n" + code : ""),
            timestamp: new Date().toISOString(),
            metrics: { postureScore, eyeContactScore }
        };
"""
if answer_save_match in content:
    content = content.replace(answer_save_match, new_answer_save)


# 4. Fix Recording Toggle Bug (onend restarting)
onend_match = """
            recognition.onend = () => {
                isRecordingRef.current = false;
                isStartingRef.current = false;
                setIsRecording(false);
                setIsStartingRecording(false);
            };
"""

new_onend = """
            recognition.onend = () => {
                // If the user hasn't explicitly clicked stop, the browser probably timed out on silence. Try to restart.
                // We use a small timeout to avoid immediate thrashing
                if (isRecordingRef.current) {
                    setTimeout(() => {
                        if (isRecordingRef.current && recognitionRef.current) {
                            try {
                                recognitionRef.current.start();
                            } catch (e) {
                                isRecordingRef.current = false;
                                setIsRecording(false);
                            }
                        }
                    }, 100);
                } else {
                    isStartingRef.current = false;
                    setIsRecording(false);
                    setIsStartingRecording(false);
                }
            };
"""
if onend_match in content:
    content = content.replace(onend_match, new_onend)


# 5. Add Code Editor UI
ui_match = """
                    {/* Transcript Box */}
                    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col min-h-[160px] max-h-[250px] shadow-lg relative overflow-hidden">
"""

new_ui = """
                    {/* Active Question Split (Transcript | Code) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Transcript Box */}
                        <div className="bg-surface border border-border rounded-xl p-5 flex flex-col min-h-[160px] shadow-lg relative overflow-hidden group">
"""
# Note: Since the exact structure might be complex, we just replace `Transcript Box` and inject an adjacent div.

with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Using regex for UI modification to avoid missing it due to slight indentation drift
pattern = re.compile(r'(\{\/\*\s*Transcript Box\s*\*\/.*?)(?=\{\/\*\s*Recording Controls\s*\*\/)', re.DOTALL)
match = pattern.search(content)

if match:
    transcript_block = match.group(1)
    
    # We want to wrap the transcript_block and a new code editor into a grid
    new_block = f"""
                    {{/* Dual Pane: Transcript & Code */}}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {transcript_block.rstrip()}
                        
                        {{/* Code Editor Box */}}
                        <div className="bg-[#0f111a] border border-border rounded-xl p-0 flex flex-col shadow-lg relative overflow-hidden focus-within:border-blue-500/30 transition-colors">
                            <div className="bg-surface/50 px-4 py-2 border-b border-border flex justify-between items-center">
                                <span className="text-xs font-semibold text-blue-400 flex items-center gap-2"><Code size={{14}} /> Scratchpad</span>
                                <span className="text-[10px] text-muted">Auto-saves on Next</span>
                            </div>
                            <textarea 
                                value={{code}}
                                onChange={{(e) => setCode(e.target.value)}}
                                placeholder="// Write your code logic or pseudocode here..."
                                className="w-full flex-1 bg-transparent p-4 text-sm font-mono text-cream/90 outline-none resize-none placeholder:text-muted/50 leading-relaxed"
                            />
                        </div>
                    </div>

                    """
    content = content[:match.start()] + new_block + content[match.end():]
else:
    print("Could not locate Transcript Box UI section via regex.")
    sys.exit(1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Modifications applied successfully.")
