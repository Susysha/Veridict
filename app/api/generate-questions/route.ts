import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("Missing GEMINI_API_KEY");
            return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
        }

        const { resumeContext, role, difficulty, count, mode } = await req.json();

        if (!resumeContext || !role) {
            console.error("Missing fields:", { hasResume: !!resumeContext, role });
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        let systemInstruction = `You are an expert interviewer conducting a **${mode}** interview for a ${role}.`;

        if (mode === "Technical" || mode === "Rapid Fire") {
            systemInstruction += `
            Generate ${count} highly technical coding, language-specific, or algorithmic questions based on the resume.
            FOCUS ON: Algorithms, Data Structures, Language intricacies (e.g. React, Python), and debugging.
            Do NOT ask behavioral or cultural fit questions.`;
        } else if (mode === "Behavioral" || mode === "HR" || mode === "Soft Skills") {
            systemInstruction += `
            Generate ${count} situational and soft-skill questions.
            FOCUS ON: STAR method (Situation, Task, Action, Result), conflict resolution, teamwork, leadership, and adaptability.
            CRITICAL: Do **NOT** ask ANY technical, coding, architecture, or system design questions. Zero technical jargon.`;
        } else if (mode === "System Design") {
            systemInstruction += `
            Generate ${count} high-level architecture and system design questions.
            FOCUS ON: Scalability, database choices, microservices, load balancing, caching, and API design.
            CRITICAL: Do NOT ask them to write code or solve LeetCode-style algorithmic puzzles. Focus on the macro architecture.`;
        } else if (mode === "Managerial") {
            systemInstruction += `
            Generate ${count} questions focusing on project execution, team management, and stakeholder communication.
            FOCUS ON: Agile delivery, mentoring, handling underperformers, and cross-functional leadership.
            CRITICAL: Do NOT ask technical implementation or coding questions.`;
        } else if (mode === "Case Study") {
            systemInstruction += `
            Generate ${count} business problem-solving scenarios.
            FOCUS ON: Product sense, critical thinking, trade-offs, and go-to-market strategies.
            CRITICAL: Do NOT ask coding or purely technical questions unless it relates broadly to business feasibility.`;
        } else {
            systemInstruction += `
            Generate ${count} mixed questions appropriate for this role.`;
        }

        const prompt = `
        ${systemInstruction}
        
        The difficulty level is: ${difficulty}.
        
        Candidate's Resume Context:
        ${resumeContext.slice(0, 3000)}
        
        Instructions:
        1. Generate exactly ${count} questions.
        2. Ensure the questions are specifically tailored to the Role: "${role}" and Resume Context provided.
        3. STRICTLY ADHERE to the mode: "${mode}". If the mode is NOT Technical, you MUST NOT ask coding questions.
        4. Return the response in strict JSON format as an array of objects with the structure:
        [
            {
                "id": 1,
                "question": "Question text here",
                "type": "${mode}",
                "difficulty": "${difficulty}"
            }
        ]
        5. Do not include markdown formatting (like \`\`\`json), just the raw JSON.
        `;

        const groqApiKey = process.env.GROQ_API_KEY;

        let text = "";

        try {
            if (!groqApiKey) {
                console.warn("Missing GROQ_API_KEY, falling back to Gemini");
                throw new Error("Missing GROQ_API_KEY");
            }

            console.log("Sending generate questions request to Groq (llama-3.3-70b-versatile)...");
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

            const MODEL = 'gemma-3-27b-it';
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey // Added as per instruction
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error("No text content in API response");
            }
        }

        // Robust JSON cleaning
        let cleanedText = text.trim();
        // Remove markdown code blocks if present (e.g., ```json ... ``` or just ``` ... ```)
        cleanedText = cleanedText.replace(/^```(json)?\s*/, "").replace(/\s*```$/, "");

        const questions = JSON.parse(cleanedText);

        return NextResponse.json({ questions });

    } catch (error: any) {
        console.error("Error generating questions:", error);
        console.error("Error details:", error.message, error.stack);
        return NextResponse.json({ error: "Failed to generate questions", details: error.message }, { status: 500 });
    }
}
