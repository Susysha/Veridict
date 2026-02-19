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

        let systemInstruction = "";
        if (role === "Software Engineer" && mode === "Technical") {
            systemInstruction = `
            You are an expert technical interviewer. Generate ${count} coding and system design interview questions.
            FOCUS ON: Algorithms, Data Structures, System Design, Database Schema, and scalable architecture.
            Do NOT ask behavioral questions.
            `;
        } else if (mode === "Behavioral" || mode === "HR" || mode === "Soft Skills") {
            systemInstruction = `
            You are an expert HR and behavioral interviewer. Generate ${count} situational and soft-skill questions.
            FOCUS ON: STAR method, conflict resolution, teamwork, leadership, and adaptability.
            Do NOT ask technical coding questions.
            `;
        } else {
            systemInstruction = `
            You are an expert interviewer for the role of ${role}. Generate ${count} mixed technical and behavioral questions suitable for this role.
            `;
        }

        const prompt = `
        ${systemInstruction}
        
        The difficulty level is: ${difficulty}.
        
        Candidate's Resume Context:
        ${resumeContext.slice(0, 3000)}
        
        Instructions:
        1. Generate exactly ${count} questions.
        2. Ensure the questions are specifically tailored to the Role: "${role}" and Resume Context provided.
        3. STRICTLY ADHERE to the mode: "${mode}".
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
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("No text content in API response");
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
