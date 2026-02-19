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

        // Prepare Payload for Direct REST API
        // Using gemini-1.5-flash as it is efficient for this task
        const payload = {
            contents: [
                {
                    parts: [
                        {
                            text: `You are an expert technical recruiter. Analyze the attached resume.
                            
                            CRITICAL INSTRUCTION FOR SKILLS:
                            - Extract skills EXACTLY as written in the resume.
                            - Do NOT categorize, group, or infer skills. 
                            - If the resume says "React.js", output "React.js". Do not change it to "Frontend Development" or "React".
                            - If the resume lists "Python, Django, Flask", output three separate skills: "Python", "Django", "Flask".
                            - Do NOT add skills that are not explicitly mentioned.

                            Return ONLY a raw JSON object (no markdown) with this structure:
                            {
                                "name": "Candidate Name",
                                "role": "Inferred Target Role",
                                "experienceLevel": "Fresher" | "Mid" | "Senior",
                                "skills": [
                                    { "name": "Skill Name", "rating": 80, "category": "Technical" }
                                ],
                                "detailedAnalysis": {
                                    "summary": "Professional summary.",
                                    "strengths": ["Strength 1", "Strength 2"],
                                    "weaknesses": ["Weakness 1", "Weakness 2"],
                                    "recommendations": ["Recommendation 1"],
                                    "projects": ["Project 1"],
                                    "achievements": ["Achievement 1"]
                                }
                            }
                            `
                        },
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

        const MODEL = 'gemma-3-27b-it';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

        console.log("Sending direct REST request to Gemini...");

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error:", response.status, errorText);

            // Handle 503 Overloaded specifically
            if (response.status === 503) {
                return NextResponse.json({ error: "Gemini Service Overloaded", details: "Please try again in a moment." }, { status: 503 });
            }

            return NextResponse.json({ error: "Gemini API failed", details: errorText }, { status: response.status });
        }

        const data = await response.json();
        console.log("Gemini response received.");

        // Extract text safely
        let text = "";
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
            text = data.candidates[0].content.parts[0].text;
        } else {
            console.error("Unexpected response structure:", JSON.stringify(data, null, 2));
            throw new Error("Invalid response structure from Gemini API");
        }

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
