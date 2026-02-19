# Veridict (InterviewIQ) 🧠🎤

**Veridict** is an advanced **AI-powered Interview Intelligence Console** designed to bridge the gap between preparation and performance. It provides candidates with a realistic, high-pressure interview environment that evaluates not just *what* they say, but *how* they say it—analyzing speech, body language, and technical accuracy in real-time.

---

## 🚀 The Problem

Traditional interview preparation is broken:
- **No Feedback Loop**: Candidates practice in front of mirrors or friends who can't provide objective technical feedback.
- **Subjectivity**: "You seem nervous" is not actionable. Candidates need data-driven insights.
- **Static Content**: Reading "Top 100 Java Questions" doesn't prepare you for the dynamic, follow-up intensive nature of real interviews.
- **Holistic Gaps**: Technical skills are only half the battle. Body language, eye contact, and confidence often decide the outcome.

## 💡 The Solution

**Veridict** acts as your personal AI Interview Coach. It creates dynamic, role-specific interview sessions where an AI interviewer speaks to you, listens to your answers, watches your camerea feed, and provides a comprehensive **Performance Report** instantly.

### Key Features
- **Real-Time Technical Interviewer**: Uses **Google Gemma** to generate context-aware questions based on your specific Resume and Role.
- **Live Body Language Analysis**: Uses **MediaPipe** to track facial landmarks, posture, and eye contact in real-time within the browser.
- **Speech Intelligence**:
    - **Speech-to-Text (STT)**: Uses the **Web Speech API** for unlimited, low-latency transcription.
    - **Text-to-Speech (TTS)**: Features high-quality voice output via **Speechmatics** (with browser fallback) for a lifelike experience.
- **Dynamic Dashboard**: Tracks progress, sets goals (Preparation Plan), and visualizes improvement over time using Radar Charts and Trend Lines.
- **Smart Feedback**: Detailed "Growth Areas" and "Key Strengths" analysis for every session.

---

## 🛠 Tech Stack

Built with a modern, performance-first stack:

### **Frontend**
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

### **AI & Machine Learning**
- **LLM**: [Google Gemma](https://ai.google.dev/gemma) (via Google AI Studio)
- **Computer Vision**: [MediaPipe Tasks Vision](https://developers.google.com/mediapipe/solutions/vision/face_landmarker) (Client-side WASM)
- **Speech-to-Text**: Browser Native **Web Speech API** (Zero-latency, Privacy-focused)
- **Text-to-Speech**: **Speechmatics API** (Server-side) with **SpeechSynthesis** fallback.

### **Backend & Infrastructure**
- **Auth**: [Firebase Authentication](https://firebase.google.com/) (Google & Email/Password)
- **API**: Next.js Server Actions & API Routes
- **Storage**: `sessionStorage` for transient interview states.

---

## 📂 Project Structure

```bash
/app
  /api          # Serverless functions (TTS, Analysis, Questions)
  /dashboard    # User Analytics & Preparation Plan
  /interview    # Core simulation engine (MediaPipe & STT logic)
  page.tsx      # Landing Page + Authentication
/lib
  firebase.ts   # Auth configuration
```

## 🔄 System Workflow

The Veridict architecture follows a sophisticated multi-stage pipeline to ensure realistic simulation and accurate feedback.

### 1. **Onboarding & Context Injection**
   - **Authentication**: Secure login via **Firebase Auth** guarantees user data privacy and session persistence.
   - **Resume Parsing**: The user uploads a resume (PDF/DOCX).
   - **AI Context Extraction**: **Google Gemma** analyzes the resume to extract:
     - *Skills & Tech Stack*
     - *Experience Level* (Junior/Mid/Senior)
     - *Project History*
   - This metadata creates a unique **"Candidate Profile"** that drives the entire session.

### 2. **Dynamic Question Generation (RAG-Lite)**
   - Instead of static question banks, Veridict uses the Candidate Profile + Chosen Role (e.g., "Senior React Dev") to generate **custom interview questions** on the fly.
   - **Logic**: Questions are categorized into *Technical*, *Behavioral*, and *System Design*.
   - **Adaptability**: If a user selects "Google" as the target company, the AI adjusts the difficulty and question style (e.g., more LeetCode-style for FAANG).

### 3. **The Active Interview Loop (Real-Time Core)**
   This is the heart of the application, running multiple parallel streams:

   - **A. Audio Output (TTS Engine)**
     - The AI interviewer speaks the question using **Speechmatics Neural TTS** for human-like intonation.
     - **Fallback System**: If the server TTS fails or hits limits, the system instantly switches to the browser’s native `SpeechSynthesis` API to ensure zero interruption.
   
   - **B. Audio Input (STT Engine)**
     - The user’s voice is captured via **Web Speech API** (for unlimited transcription).
     - **Silence Detection**: The system intelligently detects when the user finishes answering to auto-advance (or allows manual control).

   - **C. Visual Intelligence (Computer Vision)**
     - **MediaPipe Face Landmarker** runs locally in the browser (WASM) at 30fps.
     - **Posture Analysis**: Tracks shoulder and nose coordinates to detect slouching or leaning.
     - **Eye Contact Tracking**: Uses iris tracking and head pose geometry to calculate an "Attention Score."
     - **Real-Time Nudges**: If the user looks away too often or slouches, a subtle UI notification nudges them to correct it *during* the answer.

### 4. **Post-Processing & Analysis**
   - Once the session ends, the raw data (Audio Transcripts + Vision Metadata) is bundled.
   - **Multi-Modal Analysis**: Gemma accepts the entire transcript + aggregated vision scores.
   - **Scoring Engine**:
     - *Technical Accuracy*: 0-100 score based on answer correctness.
     - *Communication*: Evaluates clarity, filler word usage (via transcript analysis), and pacing.
     - *Non-Verbal*: Aggregated score from the MediaPipe session.

### 5. **Feedback & Action Plan**
   - The user receives a **Performance Report** with:
     - **Spider Graph**: Visualizing competence across 5 axes (Technical, Comm, Body Lang, Confidence, Vocab).
     - **Actionable Feedback**: "You used 'um' 12 times. Try pausing instead."
     - **Preparation Plan**: AI-generated tasks (e.g., "Review React Hooks", "Practice STAR method") added to their Dashboard.

---

---

## ⚡ Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/veridict.git
   cd veridict
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
    SPEECHMATICS_API_KEY=your_speechmatics_key
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   # ... other firebase config
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   Navigate to `http://localhost:3000`

---

## 🚀 Future Scope & Roadmap

Veridict is evolving from a simulation tool to a comprehensive career acceleration platform.

### **Phase 1: Content Expansion (PYQs)**
- [ ] **Previous Year Questions (PYQs)**: Integration with a database of real interview questions from top companies (Google, Amazon, Microsoft, Uber).
    - *Feature*: "Simulate a 2023 Google L4 Interview."
- [ ] **Company-Specific Personas**: AI interviewers with distinct personalities (e.g., "The Strict FinTech Interviewer" vs. "The Friendly Startup Founder").

### **Phase 2: Community & Peer Learning**
- [ ] **P2P Mock Interviews**: Connect users preparing for similar roles to interview each other.
- [ ] **Leaderboards**: Gamified streaks and scores to encourage daily practice.
- [ ] **Community Anonymized Reviews**: Share your AI feedback score to see where you rank globally.

### **Phase 3: Advanced AI Features**
- [ ] **Voice Cloning**: Upload a sample of your favorite tech influencer or mentor, and have *them* interview you.
- [ ] **Code-Pairing Environment**: A collaborative code editor ensuring the AI can "read" your code in real-time during coding rounds.
- [ ] **Biometric Stress Analysis**: (Experimental) using remote photoplethysmography (rPPG) to detect heart rate variability via webcam to measure stress levels.

### **Phase 4: Mobile Ecosystem**
- [ ] **React Native App**: For practicing behavioral questions (STAR method) on the go.
- [ ] **Offline Mode**: Practice pitch intros without an internet connection.

---

## 🌟 Why It Works

By combining **Computer Vision** (for non-verbal cues) with **Generative AI** (for technical depth), Veridict offers the only 360-degree interview view available to candidates today. It doesn't just check your code; it trains your presence.
