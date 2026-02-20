import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Gemini API Key missing" }, { status: 500 });
        }

        const { answers, postureScore, eyeContactScore, role } = await req.json();

        // Construct the prompt
        const prompt = `
        You are an expert Interview Coach and Technical Recruiter. Analyze the following interview session for the role of "${role}".
        
        Using the candidate's answers and the provided body language metrics, generate a detailed performance report.
        
        **Body Language Metrics (0-100):**
        - Posture Score: ${postureScore} (consistency of head position)
        - Eye Contact Score: ${eyeContactScore} (focus on camera/screen)

        **Interview Transcript:**
        ${JSON.stringify(answers, null, 2)}

        **Analysis Instructions:**
        1. **Technical Clarity (0-100)**: Evaluate the correctness, depth, and clarity of technical answers. Be strict.
        2. **Communication (0-100)**: Evaluate fluency, structure (STAR method), and confidence. Detect filler words (estimated).
        3. **Vocabulary**: Rate the vocabulary (Basic, Intermediate, Advanced, Expert).
        4. **Key Strengths**: Identify 3 strong points.
        5. **Growth Areas**: Identify 3 areas for improvement.
        6. **Question-by-Question Feedback**: Short critique for each answer.
        7. **Overall Score (0-100)**: A weighted average. Do not hesitate to give a low score (even 0) if the performance is poor.

        **Return ONLY raw JSON (no markdown) with this structure:**
        {
            "overallScore": number,
            "technicalScore": number,
            "communicationScore": number,
            "bodyLanguageScore": number,
            "vocabularyLevel": "string",
            "estimatedFillerWords": number,
            "strengths": ["string", "string", "string"],
            "weaknesses": ["string", "string", "string"],
            "questionFeedback": [
                { "questionId": number, "feedback": "string", "score": number }
            ],
            "summary": "2-3 sentences summarizing the candidate's performance."
        }
        `;

        const groqApiKey = process.env.GROQ_API_KEY;

        let text = "";

        try {
            if (!groqApiKey) {
                console.warn("Missing GROQ_API_KEY, falling back to Gemini");
                throw new Error("Missing GROQ_API_KEY");
            }

            console.log("Sending analysis request to Groq (llama-3.3-70b-versatile)...");
            const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${groqApiKey}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: prompt }]
                })
            });

            if (!groqResponse.ok) {
                const errorText = await groqResponse.text();
                throw new Error(`Groq API Error: ${groqResponse.status} ${errorText}`);
            }

            const groqData = await groqResponse.json();
            text = groqData.choices?.[0]?.message?.content;

            if (!text) {
                throw new Error("No text content in Groq API response");
            }
        } catch (groqError: any) {
            console.warn("Groq API failed, falling back to Gemini:", groqError.message);

            const MODEL = 'gemma-3-27b-it'; // User requested Gemma, matching generation style
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

            console.log(`Sending analysis request to ${MODEL}...`);

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Gemini API Error: ${response.status}`, errorText);
                throw new Error(`Gemini API Error: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                console.error("Gemini Empty Response:", JSON.stringify(data, null, 2));
                throw new Error("No output from AI");
            }
        }

        // Clean JSON
        console.log("Raw Gemini Output:", text); // Debugging
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        let analysis;
        try {
            analysis = JSON.parse(text);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError, "Text:", text);
            throw new Error("Failed to parse AI response. Raw output logged.");
        }

        return NextResponse.json({ analysis });

    } catch (error: any) {
        console.error("Analysis Error:", error);
        return NextResponse.json({ error: "Failed to analyze interview", details: error.message }, { status: 500 });
    }
}
