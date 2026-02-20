
<div align="center">

# 🧠 Veridict (InterviewIQ) 🎤
### The AI-Powered Interview Intelligence Console

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.o&logoColor=white)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Gemma](https://img.shields.io/badge/AI-Google%20Gemma-blue?style=for-the-badge&logo=google&logoColor=white)
![MediaPipe](https://img.shields.io/badge/Vision-MediaPipe-orange?style=for-the-badge&logo=google&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)

<br />

**Bridge the gap between preparation and performance.**  
Veridict provides a realistic, high-pressure interview simulation that evaluates **what** you say and **how** you say it.

[View Demo](#) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 🚀 The Problem

Traditional interview preparation is fundamentally broken:

| Problem | The Veridict Solution |
| :--- | :--- |
| **🪞 No Feedback Loop** | Practice with a **Real-Time AI Interviewer** that listens and responds. |
| **🤷‍♂️ Subjectivity** | Get **Data-Driven Insights** (0-100 scores) instead of "you seem nervous." |
| **📚 Static Content** | **Dynamic Questions** generated from *your* resume and target role. |
| **👀 Holistic Gaps** | **Computer Vision** analyzes eye contact, posture, and confidence. |

---

## 🛠 Tech Stack & Architecture

Built with a performance-first philosophy using the bleeding edge of web tech.

### **Frontend & UI**
- **Framework**: `Next.js 16` (App Router)
- **Library**: `React 19` (Server Actions)
- **Styling**: `Tailwind CSS v4` + **Lucide React** Icons

### **Artificial Intelligence**
- **🧠 LLM**: **Google Gemma 2** (via Google AI Studio) for context-aware reasoning.
- **👁️ Vision**: **MediaPipe Face Landmarker** (Client-side WASM) for real-time body language tracking.
- **🗣️ Speech**: 
    - **STT**: Browser Native `Web Speech API` (Zero-latency).
    - **TTS**: **Speechmatics Neural API** (Natural prosody) + Fallback.

### **Infrastucture**
- **Auth**: `Firebase Authentication` (OAuth + Email/Pass).
- **Backend**: Serverless API Routes (Next.js).

---

## 🔄 System Workflow

The Veridict architecture follows a sophisticated multi-stage pipeline.

### 1. **Onboarding & Context Injection**
   - **Resume Parsing**: Upload PDF/DOCX.
   - **Context Extraction**: **Gemma** extracts *Skills*, *Experience Level*, and *Project History* from your resume to build a **Candidate Profile**.

### 2. **Dynamic Question Generation (RAG-Lite)**
   - **Adaptive Logic**: Questions are generated on-the-fly based on your profile and chosen role (e.g., "Senior React Dev").
   - **Difficulty Tuning**: Targets specific companies (e.g., "Google" mode asks harder system design questions).

### 3. **The Active Interview Loop**
   - **🔊 Audio Output**: AI Interviewer speaks with human-like intonation.
   - **🎤 Audio Input**: Detailed full-duplex speech recognition.
   - **👁️ Visual Intelligence**: 
     - **Posture Analysis**: Detects slouching.
     - **Eye Contact**: Tracks iris movement for "Attention Score".
     - **Real-Time Nudges**: Subtle UI alerts if you look away too often.

### 4. **Post-Processing & Scoring**
   - **Technical Accuracy** (0-100)
   - **Communication Score** (Fluency, filler words, pacing)
   - **Non-Verbal Score** (Body language aggregation)

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- NPM or PNPM

### Installation

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
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Launch**
   Open `http://localhost:3000` to start your prep.

---

## � Roadmap & Future Scope

| Phase | Feature | Description |
| :--- | :--- | :--- |
| **Phase 1** | **PYQ Integration** | Database of real questions from FAANG companies. |
| **Phase 1** | **Personas** | "Strict Interviewer" vs "Friendly Founder" modes. |
| **Phase 2** | **P2P Mock Interviews** | Connect with peers for live mock sessions. |
| **Phase 3** | **Voice Cloning** | Be interviewed by a clone of your favorite tech influencer. |
| **Phase 4** | **Mobile App** | React Native app for on-the-go STAR method practice. |

---

## 🌟 Why It Works

> "It doesn't just check your code; it trains your presence."

By combining **Computer Vision** (for non-verbal cues) with **Generative AI** (for technical depth), Veridict offers the only 360-degree interview view available to candidates today.

---

<div align="center">

**Made with ❤️ using Next.js & Google Gemma**

</div>
