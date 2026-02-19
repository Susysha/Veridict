
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.SPEECHMATICS_API_KEY;
        if (!apiKey) {
            console.error("Missing SPEECHMATICS_API_KEY");
            return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
        }

        const { text, voice = "sarah" } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "Missing text" }, { status: 400 });
        }

        // Speechmatics TTS Endpoint
        // Docs: https://docs.speechmatics.com/features/text-to-speech
        const url = `https://preview.tts.speechmatics.com/generate/${voice}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Speechmatics TTS API Error:", response.status, errorText);
            return NextResponse.json({ error: "TTS Generation Failed", details: errorText }, { status: response.status });
        }

        // Return the audio stream directly
        return new NextResponse(response.body, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Cache-Control": "no-cache"
            }
        });

    } catch (error: any) {
        console.error("Internal TTS Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
