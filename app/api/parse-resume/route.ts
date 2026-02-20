import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    console.log("--- Resume Parse Request (Direct REST) Started ---");

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("CRITICAL: Gemini API Key is missing.");
            return NextResponse.json({ error: "Gemini API Key missing" }, { status: 500 });
        }

        const formData = await req.formData();
        const file = formData.get("resume") as File;

        if (!file) {
            console.error("No file uploaded.");
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        console.log(`File: ${file.name} | Size: ${file.size}`);

        // Convert to base64
        const arrayBuffer = await file.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString("base64");

        // Step 1: Use Gemini to extract raw text from the PDF
        const EXTRACT_MODEL = 'gemma-3-27b-it';
        const extractUrl = `https://generativelanguage.googleapis.com/v1beta/models/${EXTRACT_MODEL}:generateContent?key=${apiKey}`;

        console.log("Step 1: Extracting text from PDF using Gemini...");

        const extractPayload = {
            contents: [
                {
                    parts: [
                        { text: "Extract the exact, raw text from this resume PDF accurately, maintaining structure where possible. Do not summarize or alter the text." },
                        {
                            inline_data: {
                                mime_type: "application/pdf",
                                data: base64Data
                            }
                        }
                    ]
                }
            ]
        };

        const extractResponse = await fetch(extractUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey
            },
            body: JSON.stringify(extractPayload)
        });

        if (!extractResponse.ok) {
            const errorText = await extractResponse.text();
            console.error("Gemini Extraction Error:", extractResponse.status, errorText);
            if (extractResponse.status === 503) {
                return NextResponse.json({ error: "Gemini Service Overloaded", details: "Please try again in a moment." }, { status: 503 });
            }
            return NextResponse.json({ error: "Failed to read PDF with Gemini", details: errorText }, { status: extractResponse.status });
        }

        const extractData = await extractResponse.json();
        let extractedText = "";

        if (extractData.candidates && extractData.candidates[0]?.content?.parts?.[0]) {
            extractedText = extractData.candidates[0].content.parts[0].text;
        } else {
            throw new Error("Invalid response structure from Gemini extraction");
        }

        console.log("================ GEMMA EXTRACTED TEXT ================");
        console.log(extractedText);
        console.log("======================================================");

        // Step 2: Use Groq (Llama 3.3 70B) to parse the text into structured JSON
        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) {
            console.error("Missing GROQ_API_KEY for JSON structuring.");
            // If we don't have Groq, we'd need a fallback, but per instructions we MUST use Groq for Analysis
            throw new Error("Missing GROQ_API_KEY");
        }

        const promptText = `You are a highly experienced and meticulous technical recruiter and resume analyst. Your task is to perform an extremely detailed, exhaustive analysis of the provided resume text.
                            
                            CRITICAL INSTRUCTION FOR SKILLS:
                            - Extract EVERY SINGLE technical, soft, and domain skill explicitly mentioned.
                            - Extract skills EXACTLY as written in the resume. 
                            - Do NOT categorize, group, or infer skills. 
                            - If the resume says "React.js", output "React.js". Do not change it to "Frontend" or "React".
                            - If the resume lists "Python, Django, Flask", output three separate skills: "Python", "Django", "Flask".

                            Return ONLY a deeply comprehensive, heavily detailed raw JSON object (no markdown, no backticks, ONLY JSON) with this exact structure:
                            {
                                "name": "Candidate Full Name",
                                "role": "Inferred Target Role (be highly specific)",
                                "experienceLevel": "Fresher" | "Junior" | "Mid" | "Senior" | "Lead",
                                "skills": [
                                    { "name": "Exact Skill Name", "rating": 80, "category": "Technical | Soft | Domain" }
                                ],
                                "detailedAnalysis": {
                                    "summary": "A highly detailed, comprehensive 3-5 sentence professional summary of the candidate's entire profile and core value proposition.",
                                    "strengths": ["Highly detailed strength 1 with context", "Highly detailed strength 2...", "Strength 3...", "Strength 4..."],
                                    "weaknesses": ["Detailed potential area for growth 1", "Detailed weakness 2..."],
                                    "recommendations": ["Actionable recommendation for interview 1", "Recommendation 2..."],
                                    "projects": ["Detailed project description 1", "Detailed project 2..."],
                                    "achievements": ["Major achievement 1", "Major achievement 2..."]
                                }
                            }`;

        console.log("Step 2: Sending extracted text to Groq (llama-3.3-70b-versatile) for JSON structuring...");

        let text = "";

        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${groqApiKey}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: promptText },
                    { role: "user", content: `Here is the extremely detailed raw resume text:\n\n${extractedText.slice(0, 15000)}` }
                ]
            })
        });

        if (!groqResponse.ok) {
            const errorText = await groqResponse.text();
            throw new Error(`Groq Analysis Error: ${groqResponse.status} ${errorText}`);
        }

        const groqData = await groqResponse.json();
        text = groqData.choices?.[0]?.message?.content;

        if (!text) {
            throw new Error("No text content in Groq API response");
        }

        console.log("================ GROQ GENERATED JSON =================");
        console.log(text);
        console.log("======================================================");

        // Clean & Parse JSON
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        let parsedData;
        try {
            parsedData = JSON.parse(jsonStr);
        } catch (e) {
            console.error("JSON Parse Error. Raw text:", text);
            return NextResponse.json({ error: "Failed to parse JSON from AI", raw: text }, { status: 500 });
        }

        console.log("Parsing successful.");
        return NextResponse.json(parsedData);

    } catch (error: any) {
        console.error("FATAL ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
