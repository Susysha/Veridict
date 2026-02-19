
import { NextResponse } from "next/server";

export async function GET() {
    const apiKey = process.env.SPEECHMATICS_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: "Missing Speechmatics API Key" }, { status: 500 });
    }

    try {
        const response = await fetch("https://mp.speechmatics.com/v1/api_keys?type=rt", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({ ttl: 3600 }) // 1 hour token
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Speechmatics Token Error:", errorText);
            return NextResponse.json({ error: "Failed to generate token", details: errorText }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json({ key_value: data.key_value });

    } catch (error) {
        console.error("Internal Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
